"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { getDb } from "@/lib/firebase";
import { uploadFile } from "@/lib/storage";
import type { InfluencerProfile, BrandProfile } from "@/types/profile";
import {
  defaultInfluencerProfile,
  defaultBrandProfile,
} from "@/types/profile";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const locale = useLocale();
  const { user, profile, loading, needOnboarding, refreshRoleProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [infl, setInfl] = useState<InfluencerProfile>(defaultInfluencerProfile);
  const [brand, setBrand] = useState<BrandProfile>(defaultBrandProfile);

  if (!user || !profile) return null;

  const isInfluencer = profile.role === "influencer";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const db = getDb();
      if (isInfluencer) {
        let avatarUrl = infl.avatarUrl;
        const avatarFile = avatarInputRef.current?.files?.[0];
        if (avatarFile) {
          avatarUrl = await uploadFile(user.uid, avatarFile, "avatar");
        }
        const data: InfluencerProfile & { createdAt?: unknown } = {
          ...infl,
          displayName: (profile?.displayName ?? user.displayName) || "",
          avatarUrl,
          niches: infl.niches.filter(Boolean),
          followers: {
            instagram: infl.followers?.instagram ?? 0,
            tiktok: infl.followers?.tiktok ?? 0,
            youtube: infl.followers?.youtube ?? 0,
          },
          rates: {
            post: Number(infl.rates?.post) || 0,
            story: Number(infl.rates?.story) || 0,
            reels: Number(infl.rates?.reels) || 0,
          },
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "influencerProfiles", user.uid), data);
      } else {
        let logoUrl = brand.logoUrl;
        const logoFile = logoInputRef.current?.files?.[0];
        if (logoFile) {
          logoUrl = await uploadFile(user.uid, logoFile, "logo");
        }
        await setDoc(doc(db, "brandProfiles", user.uid), { ...brand, logoUrl });
      }
      await refreshRoleProfile();
      toast.success(t("success"));
      router.push(`/${locale}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Помилка збереження");
    } finally {
      setSaving(false);
    }
  }

  const content = (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isInfluencer ? t("influencerTitle") : t("brandTitle")}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
          {isInfluencer ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("avatar")}</label>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("bio")} *</label>
                <textarea
                  value={infl.bio}
                  onChange={(e) => setInfl((p) => ({ ...p, bio: e.target.value }))}
                  required
                  rows={4}
                  placeholder={t("bioPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("niches")}</label>
                <input
                  type="text"
                  value={infl.niches.join(", ")}
                  onChange={(e) =>
                    setInfl((p) => ({
                      ...p,
                      niches: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                  placeholder={t("nichesPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("city")}</label>
                <input
                  type="text"
                  value={infl.city}
                  onChange={(e) => setInfl((p) => ({ ...p, city: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("instagram")}</label>
                  <input
                    type="number"
                    min={0}
                    value={infl.followers?.instagram ?? ""}
                    onChange={(e) =>
                      setInfl((p) => ({
                        ...p,
                        followers: { ...p.followers, instagram: Number(e.target.value) || 0 },
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("tiktok")}</label>
                  <input
                    type="number"
                    min={0}
                    value={infl.followers?.tiktok ?? ""}
                    onChange={(e) =>
                      setInfl((p) => ({
                        ...p,
                        followers: { ...p.followers, tiktok: Number(e.target.value) || 0 },
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("youtube")}</label>
                  <input
                    type="number"
                    min={0}
                    value={infl.followers?.youtube ?? ""}
                    onChange={(e) =>
                      setInfl((p) => ({
                        ...p,
                        followers: { ...p.followers, youtube: Number(e.target.value) || 0 },
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("ratePost")}</label>
                  <input
                    type="number"
                    min={0}
                    value={infl.rates?.post ?? ""}
                    onChange={(e) =>
                      setInfl((p) => ({
                        ...p,
                        rates: { ...p.rates, post: Number(e.target.value) || 0 },
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("rateStory")}</label>
                  <input
                    type="number"
                    min={0}
                    value={infl.rates?.story ?? ""}
                    onChange={(e) =>
                      setInfl((p) => ({
                        ...p,
                        rates: { ...p.rates, story: Number(e.target.value) || 0 },
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("rateReels")}</label>
                  <input
                    type="number"
                    min={0}
                    value={infl.rates?.reels ?? ""}
                    onChange={(e) =>
                      setInfl((p) => ({
                        ...p,
                        rates: { ...p.rates, reels: Number(e.target.value) || 0 },
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("mediaKit")}</label>
                <input
                  type="url"
                  value={infl.mediaKitUrl ?? ""}
                  onChange={(e) => setInfl((p) => ({ ...p, mediaKitUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("logo")}</label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("companyName")} *</label>
                <input
                  type="text"
                  value={brand.companyName}
                  onChange={(e) => setBrand((p) => ({ ...p, companyName: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("industry")}</label>
                <input
                  type="text"
                  value={brand.industry}
                  onChange={(e) => setBrand((p) => ({ ...p, industry: e.target.value }))}
                  placeholder={t("industryPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("budgetRange")}</label>
                <input
                  type="text"
                  value={brand.budgetRange}
                  onChange={(e) => setBrand((p) => ({ ...p, budgetRange: e.target.value }))}
                  placeholder={t("budgetPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("website")}</label>
                <input
                  type="url"
                  value={brand.website}
                  onChange={(e) => setBrand((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("description")}</label>
                <textarea
                  value={brand.description}
                  onChange={(e) => setBrand((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder={t("descriptionPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </form>
      </div>
    </main>
  );

  useEffect(() => {
    if (!loading && user && profile && !needOnboarding) {
      router.replace(`/${locale}`);
    }
  }, [loading, user, profile, needOnboarding, locale, router]);

  if (!user || !profile) return null;
  if (!needOnboarding) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
