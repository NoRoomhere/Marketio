"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/auth-context";

/**
 * Redirects to onboarding when user is logged in but has not completed profile.
 * Use inside AuthProvider, wrap pages that require onboarding to be done (e.g. home for dashboard link later).
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading, needOnboarding } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && needOnboarding) {
      router.replace(`/${locale}/onboarding`);
    }
  }, [user, loading, needOnboarding, locale, router]);

  if (loading || (user && needOnboarding)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
