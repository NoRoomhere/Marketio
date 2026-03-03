"use client";

import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export default function HomePage() {
  const t = useTranslations("home");
  return (
    <OnboardingGuard>
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="absolute top-4 right-4">
          <LocaleSwitcher />
        </div>
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-2">
          {t("title")}
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-md">
          {t("subtitle")}
        </p>
        <p className="mt-6 text-sm text-gray-500">{t("stageNote")}</p>
      </main>
    </OnboardingGuard>
  );
}
