import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/AppHeader";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <AppHeader />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
