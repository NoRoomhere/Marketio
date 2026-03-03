"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { InfluencerProfile } from "@/types/profile";

export default function InfluencerProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const t = useTranslations("marketplace");
  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getDoc(doc(getDb(), "influencerProfiles", id))
      .then((snap) => {
        if (snap.exists()) setProfile(snap.data() as InfluencerProfile);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const locale = useLocale();

  if (loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="py-12 text-center">
        <p className="text-gray-500">Профіль не знайдено</p>
        <Link href={`/${locale}/marketplace`} className="mt-4 inline-block text-indigo-600 hover:underline">
          ← Каталог
        </Link>
      </main>
    );
  }

  const p = profile;
  const totalFollowers =
    (p.followers?.instagram ?? 0) +
    (p.followers?.tiktok ?? 0) +
    (p.followers?.youtube ?? 0);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <Link href={`/${locale}/marketplace`} className="text-sm text-indigo-600 hover:underline">
          ← {t("title")}
        </Link>
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex gap-6">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-200">
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-gray-400">—</div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile.displayName || "Інфлюенсер"}
              </h1>
              {p.city ? <p className="text-gray-500">{p.city}</p> : null}
              {p.niches?.length ? (
                <p className="mt-2 text-indigo-600">{p.niches.join(", ")}</p>
              ) : null}
              <p className="mt-2 text-sm text-gray-600">
                {t("followers")}: {totalFollowers > 0 ? totalFollowers.toLocaleString() : "—"}
              </p>
            </div>
          </div>
          {p.bio ? (
            <p className="mt-6 text-gray-700 whitespace-pre-wrap">{p.bio}</p>
          ) : null}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            {p.rates?.post != null && p.rates.post > 0 ? (
              <div>
                <div className="font-semibold text-indigo-600">{p.rates.post} грн</div>
                <div className="text-sm text-gray-500">{t("perPost")}</div>
              </div>
            ) : null}
            {p.rates?.story != null && p.rates.story > 0 ? (
              <div>
                <div className="font-semibold text-indigo-600">{p.rates.story} грн</div>
                <div className="text-sm text-gray-500">{t("perStory")}</div>
              </div>
            ) : null}
            {p.rates?.reels != null && p.rates.reels > 0 ? (
              <div>
                <div className="font-semibold text-indigo-600">{p.rates.reels} грн</div>
                <div className="text-sm text-gray-500">{t("perReels")}</div>
              </div>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/marketplace/${id}/request`}
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
            >
              {t("request")}
            </Link>
            <Link
              href={`/${locale}/chat/${id}`}
              className="inline-block rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Чат
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
