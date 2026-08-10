import React, { useState, useEffect } from "react";
import logo from "../../assets/image/logo.png";
import banner from "../../assets/image/banner.jpg";
import { loginMiddleware } from "../../../auth/authMiddleware";
import ResetPasswordModal from "./ResetPasswordModal";

const LoginPage = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState(
    () => localStorage.getItem("remembered_email") || "",
  );
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => !!localStorage.getItem("remembered_email"),
  );
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const validate = () => {
    const e = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // ── Remember me ──
    if (rememberMe) {
      localStorage.setItem("remembered_email", email);
    } else {
      localStorage.removeItem("remembered_email");
    }

    // ── Auth middleware: checks admin + all registered clients ──
    const result = await loginMiddleware(email.trim(), password);

    setIsLoading(false);

    if (!result.success) {
      setErrors({ general: result.error });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (onAuthSuccess) onAuthSuccess(result);
  };

  const inputBase = `auth-field w-full bg-white/5 backdrop-blur-sm border rounded-xl text-gray-200 text-sm py-3.5 
    transition-all duration-300 focus:outline-none focus:border-cyan-400 
    focus:bg-cyan-500/10 focus:ring-2 focus:ring-cyan-500/30 placeholder-gray-500`;

  return (
    <div className="auth-login-root min-h-screen font-sans relative overflow-hidden">
      {/* Interactive Cursor Glow */}
      <div
        className="fixed pointer-events-none z-30 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 192}px, ${mousePosition.y - 192}px)`,
        }}
      />

      {/* Original Background with Banner */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[700px] h-[700px] rounded-full top-[-200px] left-[-200px] bg-cyan-500/20 blur-3xl" />
        <img
          src={banner}
          alt="Background Banner"
          className="auth-login-background absolute top-0 left-0 w-full h-full object-cover opacity-20"
        />
        <div className="auth-login-scrim absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(6,182,212,0.08),transparent_70%)]" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* LEFT HERO PANEL */}
        <div className="auth-login-hero w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 lg:py-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16 lg:mb-20 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-lg opacity-60" />
              <div className="relative flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-12 h-auto object-contain"
                />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-all duration-300">
              E<span className="text-indigo-300">learning</span>
            </span>
          </div>

          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Welcome back
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tighter">
              <span className="text-white">Continue your</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                journey.
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Pick up right where you left off. Your courses, progress, and
              certificates are waiting.
            </p>

            {/* Info Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="auth-info-card relative flex gap-4 items-start border rounded-xl p-5">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 2L13 8H7L10 2Z"
                        fill="white"
                        fillOpacity="0.9"
                      />
                      <path
                        d="M10 18L7 12H13L10 18Z"
                        fill="white"
                        fillOpacity="0.9"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-semibold mb-1">
                    Need an account?
                  </p>
                  <p className="text-gray-400 text-xs">
                    Student accounts are created by your administrator.
                    {/* <Link
                      to="/"
                      className="text-cyan-400 font-bold ml-1 hover:underline"
                    >
                      Create account →
                    </Link> */}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="auth-login-form-panel w-full lg:w-1/2 xl:w-[55%] flex items-center justify-center px-4 sm:px-6 py-12 lg:py-16">
          <div
            className={`w-full max-w-md relative ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
          >
            {/* Animated Orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />

            {/* Main Card */}
            <div
              className="auth-login-card relative rounded-3xl p-8 transition-all duration-500 animate-[fadeUp_0.6s_cubic-bezier(0.2,0.9,0.3,1.1)] overflow-hidden"
            >
              <div className="relative z-10">
                {/* Avatar with Glow */}
                <div className="flex justify-center mb-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 36 36"
                        fill="none"
                      >
                        <circle
                          cx="18"
                          cy="12"
                          r="6"
                          stroke="white"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M5 32c0-7 5.5-12 13-12s13 5 13 12"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <h2 className="auth-login-title text-3xl font-bold text-white tracking-tight text-center mb-2">
                  Sign in
                </h2>
                <p className="auth-login-subtitle text-gray-400 text-center mb-8">
                  Enter your credentials to continue
                </p>

                {/* Error Alert */}
                {errors.general && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 animate-[shake_0.5s_ease-in-out]">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-red-300 text-sm flex-1">
                      {errors.general}
                    </span>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-5"
                >
                  {/* Email Field */}
                  <div className="relative group">
                    <label className="auth-login-label block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <div
                        className={`auth-field-icon absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${emailFocused ? "is-focused scale-110" : ""}`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M2 4L9 8.5L16 4M2 14H16V4H2V14Z"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <input
                        className={`${inputBase} pl-12 pr-4 ${errors.email ? "border-red-500" : "border-white/10 group-hover:border-white/20"} focus:border-cyan-400`}
                        type="email"
                        placeholder="dara@example.com"
                        value={email}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((p) => ({ ...p, email: "", general: "" }));
                        }}
                        autoFocus
                      />
                    </div>
                    {errors.email && (
                      <span className="text-red-400 text-xs flex items-center gap-1 mt-2">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="relative group">
                    <div className="flex justify-between items-center mb-2">
                      <label className="auth-login-label text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(true)}
                        className="text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-all hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div
                        className={`auth-field-icon absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${passwordFocused ? "is-focused scale-110" : ""}`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="7"
                            width="12"
                            height="8"
                            rx="1.2"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M5 7V5C5 3.5 6.5 2 9 2C11.5 2 13 3.5 13 5V7"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <input
                        className={`${inputBase} pl-12 pr-12 ${errors.password ? "border-red-500" : "border-white/10 group-hover:border-white/20"}`}
                        type={showPw ? "text" : "password"}
                        placeholder="Your password"
                        value={password}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((p) => ({
                            ...p,
                            password: "",
                            general: "",
                          }));
                        }}
                      />
                      <button
                        type="button"
                        className="auth-field-action absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M1 9C1 9 3 5 9 5C15 5 17 9 17 9C17 9 15 13 9 13C3 13 1 9 1 9Z"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <circle
                              cx="9"
                              cy="9"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M14 4L4 14"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M1 9C1 9 3 5 9 5C15 5 17 9 17 9C17 9 15 13 9 13C3 13 1 9 1 9Z"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <circle
                              cx="9"
                              cy="9"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-red-400 text-xs flex items-center gap-1 mt-2">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {errors.password}
                      </span>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${rememberMe ? "bg-cyan-500 border-cyan-500" : "border-white/20 bg-white/5 group-hover:border-cyan-400/50"}`}
                        >
                          {rememberMe && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="auth-login-remember text-gray-400 text-sm group-hover:text-gray-300 transition">
                        Remember me
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative group w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl text-white font-bold shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center justify-center gap-2 text-lg">
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>

      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        initialEmail={email}
      />
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-3px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(3px);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 0.7s linear infinite;
        }

        .auth-login-root {
          background:#eef3fb;
          color:#172033;
        }
        .auth-login-background { opacity:.82 !important; }
        .auth-login-scrim {
          background:
            radial-gradient(circle at 72% 34%,rgba(56,189,248,.10),transparent 38%),
            linear-gradient(180deg,rgba(3,13,23,.48),rgba(3,13,23,.74)),
            rgba(3,13,23,.20);
        }
        .auth-login-hero { background:transparent; }
        .auth-info-card {
          background:rgba(8,24,35,.58);
          border-color:rgba(207,250,254,.62);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 16px 44px rgba(0,0,0,.16);
          backdrop-filter:blur(18px) saturate(145%);
          -webkit-backdrop-filter:blur(18px) saturate(145%);
        }

        html.dark-mode .auth-login-root { background:#050812; }
        html.dark-mode .auth-login-background { opacity:.58 !important; }
        html.dark-mode .auth-login-scrim {
          background:
            radial-gradient(circle at 72% 34%,rgba(79,70,229,.10),transparent 40%),
            linear-gradient(180deg,rgba(2,7,16,.62),rgba(2,7,16,.84)),
            rgba(2,7,16,.28);
        }
        html.dark-mode .auth-info-card {
          background:rgba(7,14,29,.62);
          border-color:rgba(103,232,249,.22);
        }

        .auth-login-card {
          border-radius:28px !important;
          backdrop-filter:blur(28px) saturate(160%) !important;
          -webkit-backdrop-filter:blur(28px) saturate(160%) !important;
        }

        html:not(.dark-mode) .auth-login-card {
          background:linear-gradient(145deg,rgba(255,255,255,.82),rgba(235,242,252,.70)) !important;
          border:1px solid rgba(255,255,255,.96) !important;
          box-shadow:0 34px 90px rgba(20,32,72,.26),inset 0 1px 0 rgba(255,255,255,.98) !important;
        }

        html:not(.dark-mode) .auth-login-title { color:#172033 !important; }
        html:not(.dark-mode) .auth-login-subtitle,
        html:not(.dark-mode) .auth-login-remember { color:#64748b !important; }
        html:not(.dark-mode) .auth-login-label { color:#536079 !important; }

        html:not(.dark-mode) .auth-field {
          background:rgba(255,255,255,.90) !important;
          border-color:rgba(100,116,160,.24) !important;
          color:#172033 !important;
          caret-color:#4f46e5;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.94) !important;
        }

        html:not(.dark-mode) .auth-field:focus {
          background:#ffffff !important;
          border-color:#6366f1 !important;
          box-shadow:0 0 0 4px rgba(99,102,241,.14),inset 0 1px 0 #fff !important;
        }

        html.dark-mode .auth-login-card {
          background:linear-gradient(145deg,rgba(17,24,46,.84),rgba(5,10,25,.78)) !important;
          border:1px solid rgba(165,180,252,.22) !important;
          box-shadow:0 36px 94px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.07) !important;
        }

        html.dark-mode .auth-login-title { color:#f7f8ff !important; }
        html.dark-mode .auth-login-subtitle,
        html.dark-mode .auth-login-remember { color:#aab5d6 !important; }
        html.dark-mode .auth-login-label { color:#c5cdef !important; }

        html.dark-mode .auth-field {
          background:rgba(7,12,26,.68) !important;
          border-color:rgba(165,180,252,.18) !important;
          color:#f4f7ff !important;
          caret-color:#22d3ee;
        }

        html.dark-mode .auth-field:focus {
          background:rgba(12,20,38,.92) !important;
          border-color:#22d3ee !important;
          box-shadow:0 0 0 4px rgba(34,211,238,.13) !important;
        }

        html:not(.dark-mode) .auth-field-icon,
        html:not(.dark-mode) .auth-field-action {
          color:#475569 !important;
        }

        html:not(.dark-mode) .auth-field-icon.is-focused,
        html:not(.dark-mode) .auth-field-action:hover {
          color:#4f46e5 !important;
        }

        html.dark-mode .auth-field-icon,
        html.dark-mode .auth-field-action {
          color:#8f9aca !important;
        }

        html.dark-mode .auth-field-icon.is-focused,
        html.dark-mode .auth-field-action:hover {
          color:#22d3ee !important;
        }

        .auth-field-icon,
        .auth-field-action {
          z-index:2;
          opacity:1 !important;
        }

        /* Prevent Chrome/Safari autofill from painting yellow fields. */
        html:not(.dark-mode) .auth-field:-webkit-autofill,
        html:not(.dark-mode) .auth-field:-webkit-autofill:hover,
        html:not(.dark-mode) .auth-field:-webkit-autofill:focus {
          -webkit-text-fill-color:#172033 !important;
          -webkit-box-shadow:0 0 0 1000px #f8faff inset !important;
          caret-color:#4f46e5 !important;
          transition:background-color 9999s ease-out 0s;
        }

        html.dark-mode .auth-field:-webkit-autofill,
        html.dark-mode .auth-field:-webkit-autofill:hover,
        html.dark-mode .auth-field:-webkit-autofill:focus {
          -webkit-text-fill-color:#f4f7ff !important;
          -webkit-box-shadow:0 0 0 1000px #0c1426 inset !important;
          caret-color:#22d3ee !important;
          transition:background-color 9999s ease-out 0s;
        }

        @media (max-width:1023px) {
          .auth-login-root { overflow-y:auto; }
          .auth-login-root > .relative.z-10 { min-height:100dvh; }
          .auth-login-hero {
            min-height:auto;
            padding-top:max(28px,env(safe-area-inset-top));
            padding-bottom:22px;
            border-right:0;
          }
          .auth-login-hero > .group { margin-bottom:24px; }
          .auth-login-hero .space-y-6 > h1 { font-size:clamp(2.5rem,9vw,4rem); }
          .auth-login-hero .space-y-6 > p { font-size:1rem; }
          .auth-login-card { max-width:32rem; margin-inline:auto; }
        }

        @media (max-width:640px) {
          .auth-login-background { opacity:.68 !important; }
          .auth-login-scrim {
            background:linear-gradient(180deg,rgba(3,12,22,.55),rgba(3,12,22,.78));
          }
          .auth-login-hero { padding:24px 20px 14px; }
          .auth-login-hero > .group { margin-bottom:18px; }
          .auth-login-hero .space-y-6 { gap:14px; }
          .auth-login-hero .space-y-6 > h1 { font-size:2.6rem; }
          .auth-login-hero .space-y-6 > p,
          .auth-login-hero .auth-info-card { display:none; }
          .auth-login-form-panel {
            padding:10px 12px max(16px,env(safe-area-inset-bottom));
          }
          .auth-login-card {
            padding:24px 18px max(24px,env(safe-area-inset-bottom)) !important;
            border-radius:28px !important;
            max-height:calc(100dvh - 164px);
            overflow-y:auto;
          }
          .auth-login-card .flex.justify-center.mb-8 { margin-bottom:18px; }
          .auth-login-card .w-20.h-20 { width:64px; height:64px; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
