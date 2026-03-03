"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

export default function NotFound() {
  const locale = useLocale();
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-lg text-gray-600">Сторінку не знайдено</p>
      <Link
        href={`/${locale}`}
        className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        На головну
      </Link>
    </main>
  );
}
