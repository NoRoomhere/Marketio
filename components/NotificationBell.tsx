"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  subscribeToNotifications,
  markNotificationRead,
  type NotificationDoc,
} from "@/lib/notifications";
import { useAuth } from "@/lib/auth-context";

export function NotificationBell() {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const { user } = useAuth();
  const [list, setList] = useState<NotificationDoc[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToNotifications(user.uid, setList);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleClickNotification(n: NotificationDoc) {
    if (!n.read) await markNotificationRead(n.id);
    setOpen(false);
  }

  const unreadCount = list.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
        aria-label={t("title")}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2 font-medium text-gray-900">
            {t("title")}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {list.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">{t("empty")}</p>
            ) : (
              list.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ? `/${locale}${n.link}` : `/${locale}/requests`}
                  onClick={() => handleClickNotification(n)}
                  className={`block border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${
                    !n.read ? "bg-indigo-50/50" : ""
                  }`}
                >
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{n.body}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
