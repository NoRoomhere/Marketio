"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { getDoc, doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import {
  getChatId,
  ensureChatExists,
  sendMessage,
  subscribeToMessages,
  type ChatMessage,
} from "@/lib/chat";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ChatPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("chat");
  const otherUid = typeof params.otherUid === "string" ? params.otherUid : "";
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [otherName, setOtherName] = useState<string>("");
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !otherUid) return;
    (async () => {
      const inf = await getDoc(doc(getDb(), "influencerProfiles", otherUid));
      const brand = await getDoc(doc(getDb(), "brandProfiles", otherUid));
      const data = inf.exists() ? inf.data() : brand.exists() ? brand.data() : {};
      const name = (data as { displayName?: string; companyName?: string }).displayName
        || (data as { companyName?: string }).companyName
        || "Користувач";
      setOtherName(name);
    })();
  }, [user, otherUid]);

  useEffect(() => {
    if (!user || !otherUid) return;
    const chatId = getChatId(user.uid, otherUid);
    ensureChatExists(chatId, user.uid, otherUid).then(() => {
      setReady(true);
    });
  }, [user, otherUid]);

  useEffect(() => {
    if (!user || !otherUid || !ready) return;
    const chatId = getChatId(user.uid, otherUid);
    const unsub = subscribeToMessages(chatId, setMessages);
    return () => unsub();
  }, [user, otherUid, ready]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!user || !text || sending) return;
    setSending(true);
    setInput("");
    try {
      const chatId = getChatId(user.uid, otherUid);
      await sendMessage(chatId, user.uid, text);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  if (!user || !profile) return null;

  const content = (
    <main className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link href={`/${locale}/requests`} className="text-sm text-indigo-600 hover:underline">
            {t("backToRequests")}
          </Link>
          <h1 className="font-semibold text-gray-900">{t("title")}: {otherName}</h1>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-4 py-4">
        {!ready ? (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            {t("loading")}
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto rounded-lg bg-white p-4 shadow-sm">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-gray-500">{t("empty")}</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderUid === user.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.senderUid === user.uid
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      {msg.createdAt != null && "toDate" in (msg.createdAt as object) && (
                        <p className="mt-1 text-xs opacity-80">
                          {((msg.createdAt as { toDate: () => Date }).toDate()).toLocaleTimeString("uk-UA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="mt-4 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {t("send")}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
