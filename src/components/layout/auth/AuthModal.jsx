import React, { useState } from "react";
import {
  Chrome,
  Github,
  GraduationCap,
  Lock,
  Mail,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { loginMiddleware } from "../../../auth/authMiddleware";

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setAuthError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");

    if (!formData.email.trim() || !formData.password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMiddleware(
        formData.email.trim(),
        formData.password,
      );
      if (!result.success) {
        setAuthError(result.error || "Invalid email or password.");
        return;
      }

      setFormData({ email: "", password: "", rememberMe: false });
      onAuthSuccess(result);
    } catch (err) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider, event) => {
    event.preventDefault();
    setAuthError(`${provider} sign-in is not configured yet.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto body-font">
      <div className="flex min-h-screen items-end sm:items-center justify-center px-4 pt-4 pb-20 sm:p-0">
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
            aria-label="Close login modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="px-7 sm:px-8 pt-7 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="mb-7">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-lg shadow-indigo-300/40">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h2 className="nav-font text-2xl font-extrabold text-gray-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Sign in with your school account to continue.
              </p>
            </div>

            {authError && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{authError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Chrome, label: "Google", provider: "Google" },
                { icon: Github, label: "GitHub", provider: "GitHub" },
              ].map(({ icon: Icon, label, provider }) => (
                <button
                  key={label}
                  onClick={(event) => handleSocialLogin(provider, event)}
                  className="group flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                or email
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
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
                  onClick={() => setAuthError("Please contact your administrator to reset your password.")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-1 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-4 text-[11px] text-center text-gray-400">
              Student accounts are created by an administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
