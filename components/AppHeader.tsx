"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { NotificationBell } from "@/components/NotificationBell";

export function AppHeader() {
  const locale = useLocale();
  const t = useTranslations("common");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
      toast.success(tAuth("logoutSuccess"));
      router.push(`/${locale}`);
      router.refresh();
    } catch {
      toast.error("Помилка виходу");
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="text-xl font-bold text-indigo-600">
            {t("appName")}
          </Link>
          {user && profile ? (
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm text-gray-600 hover:text-indigo-600"
            >
              {t("dashboard")}
            </Link>
          ) : null}
          <Link
            href={`/${locale}/marketplace`}
            className="text-sm text-gray-600 hover:text-indigo-600"
          >
            {t("marketplace")}
          </Link>
          {user && profile ? (
            <Link
              href={`/${locale}/requests`}
              className="text-sm text-gray-600 hover:text-indigo-600"
            >
              {t("myRequests")}
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          {user && profile ? <NotificationBell /> : null}
          <LocaleSwitcher />
          {loading ? (
            <span className="text-sm text-gray-400">...</span>
          ) : user && profile ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {profile.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t("logout")}
              </button>
            </div>
          ) : (
            <>
              <Link
                href={`/${locale}/login`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
