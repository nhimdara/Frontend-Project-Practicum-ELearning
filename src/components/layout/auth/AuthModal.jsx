import React, { useState } from "react";
import { API_BASE_URL } from "../../../config/api";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  Chrome,
  GraduationCap,
  X,
} from "lucide-react";
import {
  loginMiddleware,
  registerMiddleware,
} from "../../../auth/authMiddleware";

const AuthModal = ({ isOpen, onClose, isLogin, setIsLogin, onAuthSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (authError) setAuthError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    // Validation
    if (!isLogin) {
      if (!formData.name.trim()) {
        setAuthError("Name is required");
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setAuthError("Passwords do not match");
        setIsLoading(false);
        return;
      }
    }

    if (formData.password.length < 6) {
      setAuthError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      let result;

      if (isLogin) {
        // Login: use localStorage middleware (works with both admin and DB users)
        result = await loginMiddleware(formData.email.trim(), formData.password);
      } else {
        // Register: hit the backend API first, then sync localStorage
        try {
          const res = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: formData.password,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setAuthError(
              data.error || "Registration failed. Please try again.",
            );
            setIsLoading(false);
            return;
          }
        } catch {
          // API unreachable — fall through to localStorage-only
        }
        // Always sync to localStorage session
        result = registerMiddleware(
          formData.name.trim(),
          formData.email.trim(),
          formData.password,
        );
      }

      if (!result.success) {
        setAuthError(result.error || "Authentication failed.");
        setIsLoading(false);
        return;
      }

      // Reset form — App.jsx's handleAuthSuccess closes the modal
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        rememberMe: false,
      });

      // Pass full middleware result so App.jsx can do role-based redirect
      onAuthSuccess(result);
    } catch (err) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    });
    setAuthError("");
    setShowPassword(false);
  };

  // Handle social login without page refresh
  const handleSocialLogin = (provider, e) => {
    e.preventDefault();
    // Add your social login logic here
    console.log(`Login with ${provider}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto body-font">
      <div className="flex min-h-screen items-end sm:items-center justify-center px-4 pt-4 pb-20 sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 transform transition-all">
          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="px-7 sm:px-8 pt-7 pb-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-7">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-lg shadow-indigo-300/40">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h2 className="nav-font text-2xl font-extrabold text-gray-900 tracking-tight">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isLogin
                  ? "Sign in to continue your journey"
                  : "Start learning for free today"}
              </p>
            </div>

            {/* Error message */}
            {authError && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl animate-shake">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Chrome, label: "Google", provider: "google" },
                { icon: Github, label: "GitHub", provider: "github" },
              ].map(({ icon: Icon, label, provider }) => (
                <button
                  key={label}
                  onClick={(e) => handleSocialLogin(provider, e)}
                  className="group flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                or email
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password field (signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Remember me & Forgot password (login only) */}
              {isLogin && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-3.5 w-3.5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 transition-colors"
                    />
                    <span className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle forgot password
                      console.log("Forgot password clicked");
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-1 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Please wait…</span>
                  </span>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Toggle auth mode */}
            <div className="mt-5 text-center">
              <button
                onClick={toggleAuthMode}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up →"
                  : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Demo credentials (login only) */}
            {isLogin && (
              <p className="mt-4 text-[11px] text-center text-gray-400">
                Demo: test@example.com / password123
              </p>
            )}

            {/* Terms & Privacy */}
            <p className="mt-5 text-[11px] text-center text-gray-400">
              By continuing you agree to our{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-indigo-500 hover:underline font-medium transition-colors"
              >
                Terms
              </a>{" "}
              &amp;{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-indigo-500 hover:underline font-medium transition-colors"
              >
                Privacy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Add shake animation for error */}
      <style>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
