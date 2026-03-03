import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-lg text-gray-600">Сторінку не знайдено</p>
      <Link
        href="/uk"
        className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        На головну
      </Link>
    </main>
  );
}
