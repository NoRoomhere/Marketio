"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { RequestStatus } from "@/types/request";

type RequestDoc = {
  id: string;
  brandUid: string;
  influencerUid: string;
  status: RequestStatus;
  budget: number;
  message: string;
  influencerDisplayName?: string;
  brandDisplayName?: string;
};

const STATUS_KEYS: Record<RequestStatus, string> = {
  pending: "statusPending",
  accepted: "statusAccepted",
  rejected: "statusRejected",
  paid: "statusPaid",
};

export default function DashboardPage() {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const tReq = useTranslations("requests");
  const { user, profile } = useAuth();
  const [sent, setSent] = useState<RequestDoc[]>([]);
  const [received, setReceived] = useState<RequestDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;
    const db = getDb();

    if (profile.role === "brand") {
      const q = query(
        collection(db, "requests"),
        where("brandUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        setSent(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequestDoc)));
        setLoading(false);
      });
      return () => unsub();
    }

    const q = query(
      collection(db, "requests"),
      where("influencerUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setReceived(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequestDoc)));
      setLoading(false);
    });
    return () => unsub();
  }, [user, profile]);

  if (!user || !profile) return null;

  const content = (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">
          {profile.role === "brand" ? t("brandTitle") : t("influencerTitle")}
        </h1>
        <p className="mt-1 text-gray-600">
          {t("welcome")}, {profile.displayName || user.email}
        </p>

        {loading ? (
          <div className="mt-8 flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : profile.role === "brand" ? (
          <BrandDashboard locale={locale} sent={sent} t={t} tReq={tReq} STATUS_KEYS={STATUS_KEYS} />
        ) : (
          <InfluencerDashboard locale={locale} received={received} t={t} tReq={tReq} STATUS_KEYS={STATUS_KEYS} />
        )}
      </div>
    </main>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}

function BrandDashboard({
  locale,
  sent,
  t,
  tReq,
  STATUS_KEYS,
}: {
  locale: string;
  sent: RequestDoc[];
  t: (k: string) => string;
  tReq: (k: string) => string;
  STATUS_KEYS: Record<RequestStatus, string>;
}) {
  const pending = sent.filter((r) => r.status === "pending").length;
  const accepted = sent.filter((r) => r.status === "accepted").length;
  const rejected = sent.filter((r) => r.status === "rejected").length;
  const recent = sent.slice(0, 5);

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t("sentRequests")}</p>
          <p className="text-2xl font-bold text-gray-900">{sent.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t("pending")}</p>
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t("accepted")}</p>
          <p className="text-2xl font-bold text-green-600">{accepted}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href={`/${locale}/marketplace`}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          {t("findInfluencers")}
        </Link>
        <Link
          href={`/${locale}/requests`}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t("viewAll")}
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800">{t("recentActivity")}</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-gray-500">{tReq("empty")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((r) => (
              <li key={r.id} className="rounded-lg border border-gray-200 bg-white p-3">
                <Link href={`/${locale}/requests`} className="block hover:opacity-90">
                  <p className="font-medium text-gray-900">
                    {tReq("to")}: {r.influencerDisplayName || r.influencerUid}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{r.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{tReq(STATUS_KEYS[r.status])}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function InfluencerDashboard({
  locale,
  received,
  t,
  tReq,
  STATUS_KEYS,
}: {
  locale: string;
  received: RequestDoc[];
  t: (k: string) => string;
  tReq: (k: string) => string;
  STATUS_KEYS: Record<RequestStatus, string>;
}) {
  const pending = received.filter((r) => r.status === "pending").length;
  const accepted = received.filter((r) => r.status === "accepted").length;
  const recent = received.slice(0, 5);

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t("receivedRequests")}</p>
          <p className="text-2xl font-bold text-gray-900">{received.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t("pending")}</p>
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t("accepted")}</p>
          <p className="text-2xl font-bold text-green-600">{accepted}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href={`/${locale}/marketplace`}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          {t("browseCatalog")}
        </Link>
        <Link
          href={`/${locale}/requests`}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t("viewAll")}
        </Link>
        <Link
          href={`/${locale}/onboarding`}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t("editProfile")}
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800">{t("recentActivity")}</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-gray-500">{tReq("empty")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((r) => (
              <li key={r.id} className="rounded-lg border border-gray-200 bg-white p-3">
                <Link href={`/${locale}/requests`} className="block hover:opacity-90">
                  <p className="font-medium text-gray-900">
                    {tReq("from")}: {r.brandDisplayName || r.brandUid}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{r.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{tReq(STATUS_KEYS[r.status])}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
