import React, { createElement, useCallback, useEffect, useState } from "react";
import { Database, ExternalLink, LogOut, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { Button, Card, PageHeader } from "../ui";

const initialForm = { name: "", email: "", password: "" };

const SuperAdminDashboard = ({ user, onLogout }) => {
  const [summary, setSummary] = useState({});
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const headers = useCallback((json = false) => ({
    ...(json ? { "Content-Type": "application/json" } : {}),
    "x-user-id": String(user?.id || ""),
    "x-user-role": "superadmin",
  }), [user?.id]);

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextSummary, nextAdmins] = await Promise.all([
        request("/superadmin/summary", { headers: headers() }),
        request("/superadmin/admins", { headers: headers() }),
      ]);
      setSummary(nextSummary);
      setAdmins(nextAdmins);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [headers, request]);

  useEffect(() => { loadData(); }, [loadData]);

  const createAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await request("/superadmin/admins", {
        method: "POST",
        headers: headers(true),
        body: JSON.stringify(form),
      });
      setForm(initialForm);
      setMessage("Administrator account created. Share the temporary password securely.");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAdmin = async (admin) => {
    if (!window.confirm(`Remove administrator ${admin.email}?`)) return;
    setError("");
    try {
      await request(`/superadmin/admins/${admin.id}`, { method: "DELETE", headers: headers() });
      setMessage("Administrator removed.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white"><ShieldCheck className="h-5 w-5" /></span><div><p className="font-bold text-slate-900">Superadmin</p><p className="text-xs text-slate-500">{user?.email}</p></div></div>
          <Button variant="ghost" onClick={onLogout}><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-10 sm:px-8">
        <PageHeader eyebrow="Platform control" title="Website management" description="Manage administrator access and open the existing administration workspace for lessons, users, projects, exams, and certificates." action={<Button as={Link} to="/admin/dashboard">Manage website data <ExternalLink className="h-4 w-4" /></Button>} />

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Website data summary">
          {Object.entries({ users: Users, lessons: Database, videos: Database, projects: Database, certificates: Database }).map(([key, icon]) => (
            <Card key={key} className="p-5">{createElement(icon, { className: "h-5 w-5 text-indigo-600" })}<p className="mt-4 text-2xl font-bold text-slate-900">{loading ? "—" : summary[key] || 0}</p><p className="mt-1 capitalize text-sm text-slate-500">{key}</p></Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[.9fr_1.4fr]">
          <Card className="p-6">
            <div className="flex items-center gap-2"><Plus className="h-5 w-5 text-indigo-600" /><h2 className="text-lg font-bold text-slate-900">Create administrator</h2></div>
            <p className="mt-2 text-sm text-slate-500">This creates a website login. A Gmail address may be used, but this does not create a Google mailbox.</p>
            <form onSubmit={createAdmin} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Full name<input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@gmail.com" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /></label>
              <label className="block text-sm font-semibold text-slate-700">Temporary password<input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3" /><span className="mt-1 block text-xs font-normal text-slate-500">At least 8 characters with a letter and number.</span></label>
              <Button className="w-full" disabled={saving}>{saving ? "Creating…" : "Create admin account"}</Button>
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-5"><h2 className="text-lg font-bold text-slate-900">Administrators</h2><p className="mt-1 text-sm text-slate-500">Superadmin accounts cannot be removed from this screen.</p></div>
            <div className="divide-y divide-slate-100">
              {admins.map((admin) => <div key={admin.id} className="flex items-center justify-between gap-4 px-6 py-4"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{admin.name}</p><p className="truncate text-sm text-slate-500">{admin.email}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${admin.role === "superadmin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>{admin.role}</span>{admin.role === "admin" && <button onClick={() => deleteAdmin(admin)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Remove ${admin.name}`}><Trash2 className="h-4 w-4" /></button>}</div></div>)}
              {!loading && admins.length === 0 && <p className="px-6 py-10 text-center text-sm text-slate-500">No administrators found.</p>}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
