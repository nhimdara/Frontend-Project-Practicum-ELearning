import React, { useMemo, useState } from "react";
import { Award, Bell, BookOpen, CheckCheck, Clock, FolderGit2, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatNotificationTime, useStudentNotifications } from "../notifications/notificationStore";

const typeConfig = {
  lesson: { icon: BookOpen, style: "bg-blue-100 text-blue-700" },
  achievement: { icon: Award, style: "bg-emerald-100 text-emerald-700" },
  deadline: { icon: Clock, style: "bg-amber-100 text-amber-700" },
  project: { icon: FolderGit2, style: "bg-purple-100 text-purple-700" },
};

export default function NotificationsPage({ user }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const { notifications, unreadCount, loading, error, refresh, markRead, markAllRead, remove, clearRead } = useStudentNotifications(user);
  const visible = useMemo(() => filter === "unread" ? notifications.filter((item) => !item.read) : notifications, [filter, notifications]);

  const openNotification = (item) => {
    markRead(item.id);
    if (item.href) navigate(item.href);
  };

  return (
    <main className="student-page student-notifications min-h-screen px-4 pb-16 pt-24 sm:px-6">
      <style>{`
        .student-notifications {
          color:#172033;
          background:radial-gradient(circle at 12% 0%,rgba(99,102,241,.12),transparent 34%),#f3f7fd !important;
        }
        .notification-page-title { color:#172033; }
        .notification-page-copy { color:#5c6880; }
        .notification-action,
        .notification-filter {
          border:1px solid rgba(255,255,255,.86);
          background:rgba(255,255,255,.72);
          color:#405069;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 8px 24px rgba(38,48,90,.08);
          backdrop-filter:blur(16px) saturate(150%);
          -webkit-backdrop-filter:blur(16px) saturate(150%);
        }
        .notification-action:hover,
        .notification-filter:hover { color:#4338ca; background:rgba(255,255,255,.92); }
        .notification-filter.is-active { color:#fff; border-color:rgba(255,255,255,.28); background:linear-gradient(135deg,#4f46e5,#8b5cf6); }
        .notification-list { border-radius:28px !important; }
        .notification-row { border-color:rgba(148,163,184,.16); }
        .notification-row:hover { background:rgba(99,102,241,.06); }
        .notification-row.is-unread { background:rgba(99,102,241,.08); }
        .notification-row-title { color:#172033; }
        .notification-row-copy { color:#5b6880; }
        .notification-row-time { color:#8995aa; }

        html.dark-mode .student-notifications {
          color:#f5f7ff;
          background:radial-gradient(circle at 12% 0%,rgba(99,102,241,.18),transparent 36%),#080b1b !important;
        }
        html.dark-mode .student-notifications .notification-page-title,
        html.dark-mode .student-notifications .notification-row-title { color:#f5f7ff !important; }
        html.dark-mode .student-notifications .notification-page-copy,
        html.dark-mode .student-notifications .notification-row-copy { color:#b3bddb !important; }
        html.dark-mode .student-notifications .notification-row-time { color:#838eaf !important; }
        html.dark-mode .student-notifications .notification-action,
        html.dark-mode .student-notifications .notification-filter {
          color:#dce3fa;
          border-color:rgba(165,180,252,.18);
          background:rgba(18,23,49,.74);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 12px 30px rgba(0,0,0,.20);
        }
        html.dark-mode .student-notifications .notification-action:hover,
        html.dark-mode .student-notifications .notification-filter:hover { color:#fff; background:rgba(99,102,241,.20); }
        html.dark-mode .student-notifications .notification-filter.is-active { color:#fff; background:linear-gradient(135deg,#6366f1,#8b5cf6); }
        html.dark-mode .student-notifications .notification-row { border-color:rgba(165,180,252,.12); }
        html.dark-mode .student-notifications .notification-row:hover { background:rgba(129,140,248,.11); }
        html.dark-mode .student-notifications .notification-row.is-unread { background:rgba(99,102,241,.13); }

        @media (max-width:640px) {
          .student-notifications { padding:calc(82px + env(safe-area-inset-top)) 12px max(28px,env(safe-area-inset-bottom)); }
          .notification-page-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); width:100%; }
          .notification-page-actions > button { justify-content:center; padding:10px 12px; }
          .notification-page-actions > button:last-child:nth-child(3) { grid-column:1 / -1; }
          .notification-list { border-radius:24px !important; }
          .notification-row { padding:16px 14px; gap:10px; }
          .notification-row > button:first-child { gap:12px; }
        }
      `}</style>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-600">Stay up to date</p>
            <h1 className="notification-page-title text-3xl font-bold">Notifications</h1>
            <p className="notification-page-copy mt-2">Lessons, achievements, and important deadlines in one place.</p>
          </div>
          <div className="notification-page-actions flex gap-2">
            <button onClick={refresh} disabled={loading} className="notification-action flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
            {unreadCount > 0 && <button onClick={markAllRead} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><CheckCheck className="h-4 w-4" />Mark all read</button>}
            {notifications.some((item) => item.read) && <button onClick={clearRead} className="notification-action rounded-xl px-4 py-2 text-sm font-semibold">Clear read</button>}
          </div>
        </div>

        <div className="mb-4 flex gap-2" role="tablist" aria-label="Notification filters">
          {[['all', `All (${notifications.length})`], ['unread', `Unread (${unreadCount})`]].map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} className={`notification-filter rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? "is-active" : ""}`}>{label}</button>
          ))}
        </div>

        <section className="notification-list student-glass-card overflow-hidden border">
          {error ? (
            <div className="px-6 py-12 text-center"><p className="font-semibold text-red-700">{error}</p><button onClick={refresh} className="mt-3 text-sm font-semibold text-indigo-600">Try again</button></div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500"><RefreshCw className="h-5 w-5 animate-spin" />Loading real-time updates…</div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center"><div className="mb-4 rounded-2xl bg-indigo-50 p-4"><Bell className="h-8 w-8 text-indigo-500" /></div><h2 className="font-semibold text-slate-900">You’re all caught up</h2><p className="mt-1 text-sm text-slate-500">New updates will appear here.</p></div>
          ) : visible.map((item) => {
            const config = typeConfig[item.type] || typeConfig.lesson;
            const Icon = config.icon;
            return <article key={item.id} className={`notification-row group flex gap-4 border-b p-5 last:border-0 ${item.read ? "" : "is-unread"}`}>
              <button onClick={() => openNotification(item)} className="flex min-w-0 flex-1 gap-4 text-left">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.style}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="notification-row-title flex items-center gap-2 font-semibold">{item.title}{!item.read && <span className="h-2 w-2 rounded-full bg-indigo-600" />}</span><span className="notification-row-copy mt-1 block text-sm">{item.message}</span><span className="notification-row-time mt-2 block text-xs font-medium">{formatNotificationTime(item.createdAt)}</span></span>
              </button>
              <button onClick={() => remove(item.id)} aria-label={`Dismiss ${item.title}`} className="self-center rounded-lg p-2 text-slate-400 opacity-60 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
            </article>;
          })}
        </section>
      </div>
    </main>
  );
}
