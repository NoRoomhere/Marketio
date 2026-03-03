"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getAuthErrorKey } from "@/lib/auth-errors";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const tErr = useTranslations("authErrors");
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error(tErr("invalidEmail"));
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success(t("loginSuccess"));
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("loginTitle")}</h1>
        <p className="text-gray-600 text-sm mb-6">{t("loginSubtitle")}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "..." : t("submitLogin")}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          {t("noAccount")}{" "}
          <Link href={`/${locale}/register`} className="text-indigo-600 hover:underline">
            {t("registerLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
