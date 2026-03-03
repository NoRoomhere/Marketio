"use client";

import { useState, useCallback, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { InfluencerProfile } from "@/types/profile";

const PAGE_SIZE = 12;

export interface InfluencerCard {
  id: string;
  profile: InfluencerProfile;
}

export function useInfluencers(filters: { niche?: string; city?: string }) {
  const [items, setItems] = useState<InfluencerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (after?: QueryDocumentSnapshot) => {
      const db = getDb();
      const col = collection(db, "influencerProfiles");
      const q = after
        ? query(
            col,
            orderBy("rating", "desc"),
            limit(PAGE_SIZE),
            startAfter(after)
          )
        : query(col, orderBy("rating", "desc"), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const list: InfluencerCard[] = snap.docs.map((d) => ({
        id: d.id,
        profile: d.data() as InfluencerProfile,
      }));
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
      return list;
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadPage()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!lastDoc || loadingMore || !hasMore) return;
    setLoadingMore(true);
    loadPage(lastDoc)
      .then((list) => {
        setItems((prev) => [...prev, ...list]);
      })
      .finally(() => setLoadingMore(false));
  }, [lastDoc, loadingMore, hasMore, loadPage]);

  const filtered = items.filter((card) => {
    if (filters.niche && filters.niche.trim()) {
      const niches = card.profile.niches?.map((n) => n.toLowerCase()) ?? [];
      if (!niches.includes(filters.niche.trim().toLowerCase())) return false;
    }
    if (filters.city && filters.city.trim()) {
      const city = (card.profile.city ?? "").toLowerCase();
      if (!city.includes(filters.city.trim().toLowerCase())) return false;
    }
    return true;
  });

  return { items: filtered, loading, loadingMore, hasMore, loadMore };
}
