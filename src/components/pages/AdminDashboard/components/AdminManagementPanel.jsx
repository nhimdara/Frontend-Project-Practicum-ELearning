import React, { useCallback, useEffect, useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../../../../config/api";

const emptyForm = { name: "", email: "", password: "" };

const generateAdminEmail = (name, admins = []) => {
  const base = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "") || "admin";
  const used = new Set(admins.map((admin) => String(admin.email).toLowerCase()));
  let email = `${base}.admin@elearning.com`;
  let suffix = 2;
  while (used.has(email)) email = `${base}.admin${suffix++}@elearning.com`;
  return email;
};

const AdminManagementPanel = ({ user }) => {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const headers = useCallback((json = false) => ({ ...(json ? { "Content-Type": "application/json" } : {}), "x-user-id": String(user?.id || ""), "x-user-role": "superadmin" }), [user?.id]);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/admins`, { headers: headers() });
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data.error || "Could not load administrators.");
      setAdmins(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [headers]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  const createAdmin = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/admins`, { method: "POST", headers: headers(true), body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not create administrator.");
      setForm(emptyForm); setMessage("Administrator account created successfully."); await loadAdmins();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const removeAdmin = async (admin) => {
    if (!window.confirm(`Remove administrator ${admin.email}?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/admins/${admin.id}`, { method: "DELETE", headers: headers() });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not remove administrator.");
      setMessage("Administrator removed."); await loadAdmins();
    } catch (err) { setError(err.message); }
  };

  const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none";
  return <div className="space-y-5">
    <div><h2 className="flex items-center gap-2 text-xl font-bold text-white"><ShieldCheck className="h-5 w-5 text-indigo-400" />Administrator Management</h2><p className="mt-1 text-sm text-slate-500">Create and remove administrators with an automatic @elearning.com login.</p></div>
    {error && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
    {message && <div role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">{message}</div>}
    <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={createAdmin} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="flex items-center gap-2 font-bold text-white"><Plus className="h-4 w-4 text-indigo-400" />Create administrator</h3>
        <div className="mt-5 space-y-4">
          <label className="block text-xs font-semibold text-slate-400">Full name<input required minLength={2} className={fieldClass} value={form.name} onChange={(e) => { const name = e.target.value; setForm({ ...form, name, email: generateAdminEmail(name, admins) }); }} /></label>
          <label className="block text-xs font-semibold text-slate-400">Generated e-learning login<input required readOnly type="email" className={`${fieldClass} cursor-not-allowed bg-slate-800 text-slate-300`} placeholder="Generated from full name" value={form.email} /><span className="mt-1 block font-normal text-slate-500">Generated automatically using the same domain as student accounts.</span></label>
          <label className="block text-xs font-semibold text-slate-400">Temporary password<input required type="password" minLength={8} className={fieldClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><span className="mt-1 block font-normal text-slate-500">At least 8 characters with a letter and number.</span></label>
          <button disabled={saving} className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">{saving ? "Creating…" : "Create admin"}</button>
        </div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-4"><h3 className="font-bold text-white">Administrators ({admins.length})</h3></div>
        <div className="divide-y divide-slate-800">{admins.map((admin) => <div key={admin.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{admin.name}</p><p className="truncate text-xs text-slate-500">{admin.email}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${admin.role === "superadmin" ? "bg-indigo-500/10 text-indigo-300" : "bg-slate-800 text-slate-400"}`}>{admin.role}</span>{admin.role === "admin" && <button onClick={() => removeAdmin(admin)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10" aria-label={`Remove ${admin.name}`}><Trash2 className="h-4 w-4" /></button>}</div></div>)}{!loading && !admins.length && <p className="px-5 py-10 text-center text-sm text-slate-500">No administrators found.</p>}{loading && <p className="px-5 py-10 text-center text-sm text-slate-500">Loading administrators…</p>}</div>
      </div>
    </div>
  </div>;
};

export default AdminManagementPanel;
