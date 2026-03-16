"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Notification = {
  _id:       string;
  title:     string;
  message:   string;
  type:      string;
  read:      boolean;
  orderId?:  string;
  createdAt: string;
};

export default function NotificationBell() {
  const { data: session }             = useSession();
  const [notifs, setNotifs]           = useState<Notification[]>([]);
  const [unread, setUnread]           = useState(0);
  const [open, setOpen]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const ref                           = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    loadNotifications();
    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadNotifications() {
    try {
      const res  = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifs(data.notifications);
        setUnread(data.unreadCount);
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ notificationId: "all" }),
      });
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  }

  async function markRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ notificationId: id }),
      });
      setNotifs(prev => prev.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  }

  if (!session) return null;

  return (
    <div ref={ref} className="relative">

      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gw-400 hover:text-white
                   transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4
                           bg-lime-400 text-gw-950 text-xs font-black
                           rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{ border: "1px solid #14532d" }}
          className="absolute right-0 top-10 w-80 bg-gw-950
                     rounded-2xl shadow-2xl shadow-black/60
                     z-50 overflow-hidden">

          {/* Header */}
          <div style={{ borderBottom: "1px solid #14532d" }}
            className="px-4 py-3 flex items-center justify-between">
            <span className="font-black text-white text-sm">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-lime-400 text-xs hover:text-white
                           transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gw-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifs.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => markRead(notif._id)}
                  style={{ borderBottom: "1px solid #14532d" }}
                  className={`px-4 py-3 cursor-pointer
                    hover:bg-gw-900/50 transition-colors
                    ${!notif.read ? "bg-lime-400/5" : ""}`}>
                  <div className="flex items-start gap-3">
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-lime-400
                                      shrink-0 mt-1.5" />
                    )}
                    <div className={!notif.read ? "" : "ml-5"}>
                      <p className="text-white text-xs font-bold mb-0.5">
                        {notif.title}
                      </p>
                      <p className="text-gw-400 text-xs leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-gw-700 text-xs mt-1">
                        {new Date(notif.createdAt).toLocaleDateString(
                          "en-IN", {
                            day:    "numeric",
                            month:  "short",
                            hour:   "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      {notif.orderId && (
                        <Link
                          href={`/orders/${notif.orderId}`}
                          className="text-lime-400 text-xs hover:underline
                                     mt-1 block">
                          View Order →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}
