"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { createNotification } from "@/lib/notifications";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function RequestPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("requests");
  const tMarket = useTranslations("marketplace");
  const id = typeof params.id === "string" ? params.id : "";
  const { user, profile } = useAuth();
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [sending, setSending] = useState(false);

  const isBrand = profile?.role === "brand";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile || profile.role !== "brand" || !id) return;
    const budgetNum = parseInt(budget, 10);
    const deadlineNum = parseInt(deadline, 10);
    if (!message.trim() || isNaN(budgetNum) || budgetNum < 0 || isNaN(deadlineNum) || deadlineNum < 1) {
      toast.error("Заповніть усі поля коректно");
      return;
    }
    setSending(true);
    try {
      const influencerSnap = await getDoc(doc(getDb(), "influencerProfiles", id));
      const influencerData = influencerSnap.exists() ? influencerSnap.data() : {};
      const influencerDisplayName = (influencerData as { displayName?: string }).displayName ?? "";
      await addDoc(collection(getDb(), "requests"), {
        brandUid: user.uid,
        influencerUid: id,
        status: "pending",
        budget: budgetNum,
        message: message.trim(),
        deadline: deadlineNum,
        createdAt: serverTimestamp(),
        brandDisplayName: profile.displayName || "",
        influencerDisplayName,
      });
      await createNotification(
        id,
        "new_request",
        "Нова заявка",
        `${profile.displayName || "Бренд"} надіслав вам заявку на співпрацю`,
        "/requests"
      );
      toast.success(t("sentSuccess"));
      window.location.href = `/${locale}/requests`;
    } catch (err) {
      console.error(err);
      toast.error("Помилка відправки");
    } finally {
      setSending(false);
    }
  }

  if (!user || !profile) return null;

  if (!isBrand) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-md text-center">
          <p className="text-gray-600">{t("onlyBrand")}</p>
          <Link href={`/${locale}/marketplace/${id}`} className="mt-4 inline-block text-indigo-600 hover:underline">
            {t("backToProfile")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-lg">
          <Link href={`/${locale}/marketplace/${id}`} className="text-sm text-indigo-600 hover:underline">
            {t("backToProfile")}
          </Link>
          <h1 className="mt-4 text-xl font-bold text-gray-900">{tMarket("request")}</h1>
          <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("message")} *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder={t("messagePlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("budget")} *</label>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("deadline")} *</label>
              <input
                type="number"
                min={1}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                placeholder="14"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? t("sending") : t("send")}
            </button>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
