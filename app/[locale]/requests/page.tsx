"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { createNotification } from "@/lib/notifications";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { RequestStatus } from "@/types/request";

type RequestDoc = {
  id: string;
  brandUid: string;
  influencerUid: string;
  status: RequestStatus;
  budget: number;
  message: string;
  deadline: number;
  createdAt: unknown;
  influencerDisplayName?: string;
  brandDisplayName?: string;
};

const STATUS_KEYS: Record<RequestStatus, string> = {
  pending: "statusPending",
  accepted: "statusAccepted",
  rejected: "statusRejected",
  paid: "statusPaid",
};

export default function RequestsPage() {
  const locale = useLocale();
  const t = useTranslations("requests");
  const { user, profile } = useAuth();
  const [sent, setSent] = useState<RequestDoc[]>([]);
  const [received, setReceived] = useState<RequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !profile) return;
    const db = getDb();
    setLoading(true);

    if (profile.role === "brand") {
      const qSent = query(
        collection(db, "requests"),
        where("brandUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsub = onSnapshot(qSent, (snap) => {
        setSent(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequestDoc)));
        setLoading(false);
      });
      return () => unsub();
    }

    const qReceived = query(
      collection(db, "requests"),
      where("influencerUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(qReceived, (snap) => {
      setReceived(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequestDoc)));
      setLoading(false);
    });
    return () => unsub();
  }, [user, profile]);

  async function updateStatus(requestId: string, status: "accepted" | "rejected") {
    if (!user) return;
    setUpdatingId(requestId);
    try {
      await updateDoc(doc(getDb(), "requests", requestId), { status });
      const requestSnap = await getDoc(doc(getDb(), "requests", requestId));
      const requestData = requestSnap.data();
      const brandUid = requestData?.brandUid as string | undefined;
      const influencerName = requestData?.influencerDisplayName as string | undefined;
      if (brandUid) {
        await createNotification(
          brandUid,
          status === "accepted" ? "request_accepted" : "request_rejected",
          status === "accepted" ? "Заявку прийнято" : "Заявку відхилено",
          status === "accepted"
            ? `${influencerName || "Інфлюенсер"} прийняв вашу заявку`
            : `${influencerName || "Інфлюенсер"} відхилив вашу заявку`,
          "/requests"
        );
      }
      toast.success(status === "accepted" ? t("accept") : t("reject"));
    } catch (err) {
      toast.error("Помилка оновлення");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!user || !profile) return null;

  const content = (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>

        {loading ? (
          <div className="mt-8 flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {profile.role === "brand" && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800">{t("sent")}</h2>
                {sent.length === 0 ? (
                  <p className="mt-2 text-gray-500">{t("empty")}</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {sent.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {t("to")}: {r.influencerDisplayName || r.influencerUid}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">{r.message}</p>
                            <p className="mt-2 text-sm text-gray-500">
                              {r.budget} грн · {r.deadline} дн. ·{" "}
                              <span className="font-medium">{t(STATUS_KEYS[r.status])}</span>
                            </p>
                            <Link
                              href={`/${locale}/chat/${r.influencerUid}`}
                              className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
                            >
                              {t("openChat")}
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {profile.role === "influencer" && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800">{t("received")}</h2>
                {received.length === 0 ? (
                  <p className="mt-2 text-gray-500">{t("empty")}</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {received.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {t("from")}: {r.brandDisplayName || r.brandUid}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">{r.message}</p>
                            <p className="mt-2 text-sm text-gray-500">
                              {r.budget} грн · {r.deadline} дн. ·{" "}
                              <span className="font-medium">{t(STATUS_KEYS[r.status])}</span>
                            </p>
                            <Link
                              href={`/${locale}/chat/${r.brandUid}`}
                              className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
                            >
                              {t("openChat")}
                            </Link>
                          </div>
                          {r.status === "pending" && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                disabled={updatingId === r.id}
                                onClick={() => updateStatus(r.id, "accepted")}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                {t("accept")}
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === r.id}
                                onClick={() => updateStatus(r.id, "rejected")}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              >
                                {t("reject")}
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

          </>
        )}
      </div>
    </main>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
