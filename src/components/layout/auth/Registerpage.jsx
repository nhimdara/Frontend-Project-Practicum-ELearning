import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/image/logo.png";
import banner from "../../assets/image/banner.jpg";
import { registerMiddleware } from "../../../auth/authMiddleware";

const RegisterPage = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: "", color: "#4b5563" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "#f97316", "#facc15", "#4ade80", "#2dd4bf"];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = getPasswordStrength(formData.password);

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name required";
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        newErrors.email = "Enter a valid email address";
    } else {
      if (formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
      if (!formData.agreeTerms)
        newErrors.agreeTerms = "Please accept the terms to continue";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);

    const fullName = `${formData.firstName} ${formData.lastName}`;

    try {
      // ── 1. Save to MySQL via backend API ──
      const response = await fetch("http://localhost:5001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general: data.error || "Registration failed. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      // ── 2. Also save to localStorage session so ProtectedRoute works ──
      registerMiddleware(fullName, formData.email, formData.password);

      setIsLoading(false);

      // ── 3. Show success then go to major selection (not login) ──
      setDone(true);
      setTimeout(() => {
        navigate("/select-major");
      }, 1800);
    } catch (err) {
      // ── Network error: fall back to localStorage-only registration ──
      console.warn(
        "API unreachable, falling back to localStorage:",
        err.message,
      );

      const result = registerMiddleware(
        fullName,
        formData.email,
        formData.password,
      );
      setIsLoading(false);

      if (!result.success) {
        setErrors({ general: result.error });
        return;
      }

      setDone(true);
      setTimeout(() => {
        navigate("/select-major");
      }, 1800);
    }
  };

  const setRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  if (done) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-[#05090f] font-sans relative overflow-hidden">
      {/* Background with your banner image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[700px] h-[700px] rounded-full top-[-200px] left-[-200px] bg-cyan-500/20 blur-3xl" />
        <img
          src={banner}
          alt="Background Banner"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-20 blur-lg"
        />
        {/* Additional gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05090f]/80 via-transparent to-[#05090f]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(6,182,212,0.08),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen max-w-[1600px] mx-auto">
        {/* Left Hero Panel */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-12 lg:py-16">
          <BrandLogo logo={logo} />

          <div className="space-y-5 max-w-xl">
            <Badge />

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tighter">
              <span className="text-white">Unlock smarter</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                learning.
              </span>
            </h1>

            <p className="text-gray-400 text-base leading-relaxed max-w-md border-l-2 border-cyan-400/40 pl-4">
              Hands-on courses, real projects, and a community of learners — all
              in one place.
            </p>

            <TestimonialCard />
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-1/2 xl:w-[55%] flex items-center justify-center px-4 sm:px-6 py-8 lg:py-16">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 transition-all duration-300 animate-fadeScale shadow-2xl">
            {/* Step Indicators */}
            <StepIndicators currentStep={step} />

            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {step === 1 ? "Create your account" : "Secure your account"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {step === 1
                  ? "Step 1 of 2 — Basic info"
                  : "Step 2 of 2 — Set a password"}
              </p>
            </div>

            {errors.general && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={step === 1 ? handleNext : handleSubmit} noValidate>
              {step === 1 ? (
                <StepOneForm
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                  onRoleSelect={setRole}
                />
              ) : (
                <StepTwoForm
                  formData={formData}
                  errors={errors}
                  onChange={handleChange}
                  showPassword={showPassword}
                  showConfirm={showConfirm}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  onToggleConfirm={() => setShowConfirm(!showConfirm)}
                  onToggleAgree={() =>
                    setFormData((prev) => ({
                      ...prev,
                      agreeTerms: !prev.agreeTerms,
                    }))
                  }
                  passwordStrength={strength}
                  isLoading={isLoading}
                  onBack={() => setStep(1)}
                />
              )}
            </form>

            <div className="mt-7 text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-cyan-400 font-semibold hover:underline transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeScale {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          100% {
            transform: translate(20px, -20px) scale(1.1);
            opacity: 0.35;
          }
        }

        .animate-fadeScale {
          animation: fadeScale 0.5s ease forwards;
        }

        .animate-float {
          animation: float 14s infinite alternate ease-in-out;
        }

        .glass-card {
          background: rgba(8, 15, 25, 0.68);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.18);
          box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.5);
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Sub-components for better organization
const BrandLogo = ({ logo }) => (
  <div className="flex items-center gap-2.5 mb-10 lg:mb-14">
    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl blur-lg opacity-60" />
      <img
        src={logo}
        alt="LearnFlow Logo"
        className="relative w-full h-full object-contain"
      />
    </div>
    <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
      E<span className="text-indigo-300">learning</span>
    </span>
  </div>
);

const Badge = () => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 w-fit backdrop-blur-sm mb-2">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
    </span>
    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
      Start for free today
    </span>
  </div>
);

const TestimonialCard = () => (
  <div className="mt-8 hidden sm:block">
    <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent mb-2.5" />
    <p className="text-gray-500 text-xs italic leading-relaxed mb-1">
      "ELearning changed how I study — I actually finish courses now."
    </p>
  </div>
);

const StepIndicators = ({ currentStep }) => (
  <div className="flex items-center mb-5">
    {[1, 2].map((n, i) => (
      <React.Fragment key={n}>
        <div
          className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            currentStep >= n
              ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/40"
              : "border-white/10 bg-white/5 text-gray-600"
          }`}
        >
          {currentStep > n ? (
            <svg width="11" height="11" viewBox="0 0 11 11">
              <path
                d="M1.5 5.5l3 3 5-5"
                stroke="white"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            n
          )}
        </div>
        {i < 1 && (
          <div
            className={`flex-1 h-0.5 mx-2 max-w-[44px] transition-all duration-300 ${
              currentStep > 1 ? "bg-cyan-500" : "bg-white/10"
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const StepOneForm = ({ formData, errors, onChange, onRoleSelect }) => (
  <>
    <div className="grid grid-cols-2 gap-3 mb-4">
      <InputField
        label="First name"
        name="firstName"
        value={formData.firstName}
        error={errors.firstName}
        onChange={onChange}
        placeholder="Nhim"
      />
      <InputField
        label="Last name"
        name="lastName"
        value={formData.lastName}
        error={errors.lastName}
        onChange={onChange}
        placeholder="Dara"
      />
    </div>

    <InputField
      label="Email address"
      name="email"
      type="email"
      value={formData.email}
      error={errors.email}
      onChange={onChange}
      placeholder="dara@example.com"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      }
    />

    <div className="flex flex-col gap-1.5 mb-6">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        I am a…
      </label>
      <div className="flex gap-2">
        {["Student", "Teacher", "Professional"].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onRoleSelect(role)}
            className={`flex-1 py-2.5 px-2 border rounded-xl text-xs font-semibold transition-all ${
              formData.role === role
                ? "border-cyan-400 bg-cyan-500/15 text-cyan-400"
                : "border-white/10 bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-400"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>

    <button
      type="submit"
      className="group w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
    >
      Continue
      <svg
        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
    </button>
  </>
);

const StepTwoForm = ({
  formData,
  errors,
  onChange,
  showPassword,
  showConfirm,
  onTogglePassword,
  onToggleConfirm,
  onToggleAgree,
  passwordStrength,
  isLoading,
  onBack,
}) => (
  <>
    <InputField
      label="Password"
      name="password"
      type={showPassword ? "text" : "password"}
      value={formData.password}
      error={errors.password}
      onChange={onChange}
      placeholder="Min. 8 characters"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      }
      rightElement={
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
        >
          {showPassword ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
              />
            </svg>
          )}
        </button>
      }
    />

    {formData.password && (
      <div className="flex items-center gap-2 mt-1.5 mb-5">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${
                passwordStrength.score >= i ? "bg-cyan-400" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <span
          className="text-[11px] font-bold"
          style={{ color: passwordStrength.color }}
        >
          {passwordStrength.label}
        </span>
      </div>
    )}

    <InputField
      label="Confirm password"
      name="confirmPassword"
      type={showConfirm ? "text" : "password"}
      value={formData.confirmPassword}
      error={errors.confirmPassword}
      onChange={onChange}
      placeholder="Repeat password"
      icon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      rightElement={
        <button
          type="button"
          onClick={onToggleConfirm}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
        >
          {showConfirm ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
              />
            </svg>
          )}
        </button>
      }
    />

    <div className="mb-6">
      <div
        className="flex items-start gap-2.5 cursor-pointer"
        onClick={onToggleAgree}
      >
        <div
          className={`w-4 h-4 min-w-4 border rounded flex items-center justify-center transition-all mt-0.5 ${
            formData.agreeTerms
              ? "bg-cyan-500 border-cyan-500"
              : "border-white/15 bg-white/5"
          }`}
        >
          {formData.agreeTerms && (
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
        <span className="text-gray-500 text-sm leading-relaxed">
          I agree to the{" "}
          <a href="#" className="text-cyan-400 font-semibold hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-cyan-400 font-semibold hover:underline">
            Privacy Policy
          </a>
        </span>
      </div>
      {errors.agreeTerms && (
        <span className="text-red-400 text-xs mt-1 block">
          {errors.agreeTerms}
        </span>
      )}
    </div>

    <div className="flex gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center gap-1.5 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-gray-500 text-sm font-semibold hover:bg-white/10 hover:text-gray-400 active:scale-[0.98] transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M12 7H2M6 3L2 7l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl text-white text-sm font-bold shadow-lg shadow-cyan-500/25 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>
    </div>
  </>
);

const InputField = ({
  label,
  name,
  type = "text",
  value,
  error,
  onChange,
  placeholder,
  icon,
  rightElement,
}) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        id={`input-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-white/5 border ${
          error ? "border-red-500" : "border-white/10"
        } rounded-xl text-gray-200 text-sm ${
          icon ? "pl-9" : "px-4"
        } ${rightElement ? "pr-10" : "pr-4"} py-2.5 transition-all duration-200 focus:outline-none focus:border-cyan-400 focus:bg-cyan-500/10 focus:ring-2 focus:ring-cyan-500/20 placeholder-gray-600`}
      />
      {rightElement}
    </div>
    {error && <span className="text-red-400 text-xs">{error}</span>}
  </div>
);

const SuccessScreen = () => (
  <div className="min-h-screen bg-[#05090f] flex items-center justify-center px-4 relative">
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute w-[700px] h-[700px] rounded-full top-[-200px] left-[-200px] bg-cyan-500/20 blur-3xl" />
    </div>
    <div className="relative z-10 text-center max-w-md animate-fadeScale">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-40 animate-pulse" />
        <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17L4 12" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-green-50 tracking-tight mb-2">
        Account created!
      </h2>
      <p className="text-gray-500 text-sm mb-6">Redirecting to sign in...</p>
      <div className="flex gap-1.5 justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default RegisterPage;
