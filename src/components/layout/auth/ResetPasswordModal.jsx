import React, { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Mail, X } from "lucide-react";
import { API_BASE_URL } from "../../../config/api";

async function post(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export default function ResetPasswordModal({ isOpen, onClose, initialEmail = "" }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  useEffect(() => {
    if (isOpen) setEmail(initialEmail || "");
  }, [initialEmail, isOpen]);

  if (!isOpen) return null;

  const run = async (action) => {
    setLoading(true);
    setError("");
    try { await action(); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const requestOtp = (event) => {
    event.preventDefault();
    run(async () => {
      const data = await post("/auth/forgot-password", { email });
      setDemoOtp(data.demoOtp || "123456");
      setStep("otp");
    });
  };
  const verifyOtp = (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code from your email.");
    run(async () => { await post("/auth/verify-reset-otp", { email, otp }); setStep("password"); });
  };
  const resetPassword = (event) => {
    event.preventDefault();
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return setError("Use at least 8 characters with a letter and number.");
    if (password !== confirmation) return setError("Passwords do not match.");
    run(async () => { await post("/auth/reset-password", { email, otp, password }); setStep("success"); });
  };
  const close = () => {
    setStep("email"); setOtp(""); setDemoOtp(""); setPassword(""); setConfirmation(""); setError(""); onClose();
  };
  const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reset-title">
    <div className="student-liquid-modal relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <button onClick={close} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
      {step !== "success" && <><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">{step === "email" ? <Mail /> : <KeyRound />}</div><h2 id="reset-title" className="text-2xl font-bold text-slate-900">{step === "email" ? "Forgot password?" : step === "otp" ? "Enter demo code" : "Create new password"}</h2><p className="mt-2 text-sm text-slate-500">{step === "email" ? "Enter your account email to create a demo reset code." : step === "otp" ? `Use the demo code below for ${email}. It expires in 10 minutes.` : "Choose a secure new password."}</p></>}
      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {step === "email" && <form onSubmit={requestOtp} className="mt-6 space-y-4"><input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus /><button disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Creating…" : "Create demo code"}</button></form>}
      {step === "otp" && <form onSubmit={verifyOtp} className="mt-6 space-y-4"><div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-800">Demo OTP: <strong className="ml-1 text-lg tracking-widest">{demoOtp}</strong></div><input className={`${input} text-center text-2xl font-bold tracking-[0.45em]`} inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="000000" required autoFocus /><button disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Verifying…" : "Verify code"}</button><button type="button" onClick={() => { setStep("email"); setError(""); }} className="w-full text-sm font-semibold text-slate-500">Change email or create another code</button></form>}
      {step === "password" && <form onSubmit={resetPassword} className="mt-6 space-y-4"><div className="relative"><input className={`${input} pr-12`} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required autoFocus /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-3.5 text-slate-400">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div><input className={input} type={showPassword ? "text" : "password"} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="Confirm new password" required /><p className="text-xs text-slate-500">At least 8 characters with a letter and number.</p><button disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Resetting…" : "Reset password"}</button></form>}
      {step === "success" && <div className="py-5 text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" /><h2 id="reset-title" className="mt-5 text-2xl font-bold text-slate-900">Password updated</h2><p className="mt-2 text-sm text-slate-500">You can now sign in with your new password.</p><button onClick={close} className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white">Back to sign in</button></div>}
    </div>
  </div>;
}
