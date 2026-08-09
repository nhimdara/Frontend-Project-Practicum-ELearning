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
    <main className="student-page student-notifications min-h-screen bg-slate-50 px-4 pb-16 pt-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-600">Stay up to date</p>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="mt-2 text-slate-600">Lessons, achievements, and important deadlines in one place.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} disabled={loading} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
            {unreadCount > 0 && <button onClick={markAllRead} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><CheckCheck className="h-4 w-4" />Mark all read</button>}
            {notifications.some((item) => item.read) && <button onClick={clearRead} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Clear read</button>}
          </div>
        </div>

        <div className="mb-4 flex gap-2" role="tablist" aria-label="Notification filters">
          {[['all', `All (${notifications.length})`], ['unread', `Unread (${unreadCount})`]].map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{label}</button>
          ))}
        </div>

        <section className="student-glass-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {error ? (
            <div className="px-6 py-12 text-center"><p className="font-semibold text-red-700">{error}</p><button onClick={refresh} className="mt-3 text-sm font-semibold text-indigo-600">Try again</button></div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500"><RefreshCw className="h-5 w-5 animate-spin" />Loading real-time updates…</div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center"><div className="mb-4 rounded-2xl bg-indigo-50 p-4"><Bell className="h-8 w-8 text-indigo-500" /></div><h2 className="font-semibold text-slate-900">You’re all caught up</h2><p className="mt-1 text-sm text-slate-500">New updates will appear here.</p></div>
          ) : visible.map((item) => {
            const config = typeConfig[item.type] || typeConfig.lesson;
            const Icon = config.icon;
            return <article key={item.id} className={`group flex gap-4 border-b border-slate-100 p-5 last:border-0 ${item.read ? "" : "bg-indigo-50/50"}`}>
              <button onClick={() => openNotification(item)} className="flex min-w-0 flex-1 gap-4 text-left">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.style}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="flex items-center gap-2 font-semibold text-slate-900">{item.title}{!item.read && <span className="h-2 w-2 rounded-full bg-indigo-600" />}</span><span className="mt-1 block text-sm text-slate-600">{item.message}</span><span className="mt-2 block text-xs font-medium text-slate-400">{formatNotificationTime(item.createdAt)}</span></span>
              </button>
              <button onClick={() => remove(item.id)} aria-label={`Dismiss ${item.title}`} className="self-center rounded-lg p-2 text-slate-400 opacity-60 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button>
            </article>;
          })}
        </section>
      </div>
    </main>
  );
}
