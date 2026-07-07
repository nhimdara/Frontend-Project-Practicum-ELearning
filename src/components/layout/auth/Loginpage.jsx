import React, { useState, useEffect } from "react";
import logo from "../../assets/image/logo.png";
import banner from "../../assets/image/banner.jpg";
import { loginMiddleware } from "../../../auth/authMiddleware";

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

  const inputBase = `w-full bg-white/5 backdrop-blur-sm border rounded-xl text-gray-200 text-sm py-3.5 
    transition-all duration-300 focus:outline-none focus:border-cyan-400 
    focus:bg-cyan-500/10 focus:ring-2 focus:ring-cyan-500/30 placeholder-gray-500`;

  return (
    <div className="min-h-screen bg-[#05090f] font-sans relative overflow-hidden">
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
          className="absolute top-0 left-0 w-full h-full object-cover opacity-20 blur-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05090f]/50 via-transparent to-[#05090f]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(6,182,212,0.08),transparent_70%)]" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* LEFT HERO PANEL */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 lg:py-16 border-r border-cyan-500/10 bg-gradient-to-r from-[#05090f]/50 to-transparent">
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
              <div className="relative flex gap-4 items-start bg-gradient-to-r from-cyan-500/5 to-indigo-500/5 border border-cyan-500/20 rounded-xl p-5 backdrop-blur-sm">
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
        <div className="w-full lg:w-1/2 xl:w-[55%] flex items-center justify-center px-4 sm:px-6 py-12 lg:py-16">
          <div
            className={`w-full max-w-md relative ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
          >
            {/* Animated Orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />

            {/* Main Card */}
            <div
              className="relative rounded-3xl p-8 transition-all duration-500 animate-[fadeUp_0.6s_cubic-bezier(0.2,0.9,0.3,1.1)] overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(15, 25, 40, 0.8) 0%, rgba(8, 15, 30, 0.9) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                boxShadow: "0 30px 60px -20px rgba(0, 0, 0, 0.8)",
              }}
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

                <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-2">
                  Sign in
                </h2>
                <p className="text-gray-400 text-center mb-8">
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
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${emailFocused ? "text-cyan-400 scale-110" : "text-gray-500"}`}
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
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Password
                      </label>
                      <a
                        href="#"
                        className="text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-all hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${passwordFocused ? "text-cyan-400 scale-110" : "text-gray-500"}`}
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-all duration-300"
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
                      <span className="text-gray-400 text-sm group-hover:text-gray-300 transition">
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

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-transparent text-xs text-gray-500">
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all group">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-xs text-gray-300">Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all group">
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
                    </svg>
                    <span className="text-xs text-gray-300">Facebook</span>
                  </button>
                </div>

                <p className="text-center text-gray-500 text-sm">
                  Need access? Contact your administrator for a student account.
                  {/* <Link
                    to="/"
                    className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline transition-all inline-flex items-center gap-1"
                  >
                    Create free account
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link> */}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
};

export default LoginPage;
