"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useInfluencers, type InfluencerCard } from "@/lib/use-influencers";

function InfluencerCardComponent({
  card,
  t,
}: {
  card: InfluencerCard;
  t: (key: string) => string;
}) {
  const locale = useLocale();
  const p = card.profile;
  const totalFollowers =
    (p.followers?.instagram ?? 0) +
    (p.followers?.tiktok ?? 0) +
    (p.followers?.youtube ?? 0);

  return (
    <Link
      href={`/${locale}/marketplace/${card.id}`}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200">
          {p.avatarUrl ? (
            <img
              src={p.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
              —
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {p.displayName || "Інфлюенсер"}
          </h3>
          {p.city ? (
            <p className="text-sm text-gray-500">{p.city}</p>
          ) : null}
          {p.niches?.length ? (
            <p className="mt-1 text-xs text-indigo-600">
              {p.niches.slice(0, 3).join(", ")}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-gray-600">
            {t("followers")}: {totalFollowers > 0 ? totalFollowers.toLocaleString() : "—"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            {p.rates?.post ? (
              <span>{p.rates.post} грн / {t("perPost")}</span>
            ) : null}
            {p.rates?.story ? (
              <span>{p.rates.story} грн / {t("perStory")}</span>
            ) : null}
            {p.rates?.reels ? (
              <span>{p.rates.reels} грн / {t("perReels")}</span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const t = useTranslations("marketplace");
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("");
  const { items, loading, loadingMore, hasMore, loadMore } = useInfluencers({
    niche: niche || undefined,
    city: city || undefined,
  });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (loadingMore || !hasMore) return;
      observerRef.current?.disconnect();
      if (!el) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) loadMore();
        },
        { rootMargin: "100px" }
      );
      observerRef.current.observe(el);
    },
    [loadMore, loadingMore, hasMore]
  );

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-gray-600">{t("subtitle")}</p>

        <div className="mt-6 flex flex-wrap gap-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("niche")}
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={t("nichePlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("city")}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("cityPlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="mt-8 text-center text-gray-500">{t("empty")}</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((card) => (
              <InfluencerCardComponent key={card.id} card={card} t={t} />
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
            {loadingMore ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            ) : hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t("loadMore")}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
