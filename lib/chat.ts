"use client";

import {
  collection,
  doc,
  setDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export function getChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

export interface ChatMessage {
  id: string;
  text: string;
  senderUid: string;
  createdAt: unknown;
}

export async function ensureChatExists(chatId: string, uid1: string, uid2: string): Promise<void> {
  const db = getDb();
  const chatRef = doc(db, "chats", chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) {
    const [p1, p2] = [uid1, uid2].sort();
    await setDoc(chatRef, { participant1: p1, participant2: p2 });
  }
}

export async function sendMessage(
  chatId: string,
  senderUid: string,
  text: string
): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, "chats", chatId, "messages"), {
    text: text.trim(),
    senderUid,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  chatId: string,
  onMessages: (messages: ChatMessage[]) => void
): () => void {
  const db = getDb();
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ChatMessage[];
    onMessages(list);
  });
}
