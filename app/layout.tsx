import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Marketio — Маркетплейс реклами у блогерів",
    template: "%s | Marketio",
  },
  description:
    "Платформа, де бізнеси замовляють розміщення у інфлюенсерів. Пости, сторис, рілси, колаборації. Україна.",
  keywords: ["маркетплейс", "реклама", "інфлюенсери", "блогери", "бренди", "співпраця", "Ukraine"],
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "Marketio",
    title: "Marketio — Маркетплейс реклами у блогерів",
    description: "Платформа, де бізнеси замовляють розміщення у інфлюенсерів.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className="antialiased min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
