"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getAuthErrorKey } from "@/lib/auth-errors";
import type { Role } from "@/types/user";

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const tErr = useTranslations("authErrors");
  const router = useRouter();
  const { signUp } = useAuth();
  const [role, setRole] = useState<Role>("influencer");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(tErr("weakPassword"));
      return;
    }
    if (password !== passwordConfirm) {
      toast.error(tErr("generic"));
      return;
    }
    if (!displayName.trim() || !email.trim()) {
      toast.error(tErr("invalidEmail"));
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim(), role);
      toast.success(t("registerSuccess"));
      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err) {
      const key = getAuthErrorKey(err);
      toast.error(tErr(key));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("registerTitle")}</h1>
        <p className="text-gray-600 text-sm mb-6">{t("registerSubtitle")}</p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setRole("influencer")}
            className={`flex-1 rounded-lg border-2 px-4 py-2 font-medium transition ${
              role === "influencer"
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {t("roleInfluencer")}
          </button>
          <button
            type="button"
            onClick={() => setRole("brand")}
            className={`flex-1 rounded-lg border-2 px-4 py-2 font-medium transition ${
              role === "brand"
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {t("roleBrand")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              {t("displayName")} *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder={t("displayNamePlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t("email")} *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t("password")} *
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
              {t("passwordConfirm")} *
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "..." : t("submitRegister")}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          {t("hasAccount")}{" "}
          <Link href={`/${locale}/login`} className="text-indigo-600 hover:underline">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
