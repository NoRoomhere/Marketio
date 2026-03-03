"use client";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Notification, NotificationType } from "@/types/notification";

export interface NotificationDoc extends Notification {
  id: string;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string
): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, "notifications"), {
    userId,
    type,
    title,
    body,
    read: false,
    createdAt: serverTimestamp(),
    link: link ?? null,
  });
}

export function subscribeToNotifications(
  userId: string,
  onUpdate: (list: NotificationDoc[]) => void
): () => void {
  const db = getDb();
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc));
    onUpdate(list);
  });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}
