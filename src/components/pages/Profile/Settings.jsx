import React, { useState, useEffect, useRef } from "react";
import {
  User, Bell, Shield, Globe, Moon, Sun, Mail, Lock,
  Smartphone, Eye, EyeOff, Save, Check, CreditCard,
  History, LogOut, AlertTriangle, Volume2, Monitor,
  Download, Clock, DollarSign, BookOpen, Award, Settings as SettingsIcon,
  Upload, Sparkles, Palette, Layers, Type, Sliders, RotateCcw, CheckCircle2,
  SunMedium, Laptop
} from "lucide-react";
import { profileApi, syncStoredSession } from "../../api/profile";
import {
  applyAllSettings,
  saveSettings,
  loadStoredSettings,
  ACCENT_PRESETS,
  FONT_SIZE_MAP,
  FONT_FAMILY_MAP
} from "../../../app/useAppTheme";

/* ─────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────── */
const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className="w-full flex items-start justify-between cursor-pointer group py-1.5 text-left"
  >
    <div className="flex-1 pr-6">
      <p className="settings-toggle-label text-sm font-semibold transition-colors">{label}</p>
      {description && <p className="settings-toggle-description text-xs mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <div className="relative inline-flex flex-shrink-0 items-center mt-0.5">
      <div className={`settings-toggle-track w-11 h-6 rounded-full transition-all duration-300 ${checked ? "shadow-md" : ""}`}
           style={{ background: checked ? "var(--accent-gradient, linear-gradient(135deg,#6366f1,#8b5cf6))" : undefined }} />
      <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </div>
  </button>
);

const SectionHeader = ({ title, description, onSave, isLoading, extraActions }) => (
  <div className="settings-section-header flex items-start justify-between mb-7 pb-5 border-b border-gray-100 dark:border-gray-800">
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
    </div>
    <div className="flex items-center gap-2.5 flex-shrink-0 ml-4">
      {extraActions}
      <button onClick={onSave} disabled={isLoading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all disabled:opacity-60 hover:scale-105 active:scale-95"
        style={{ background: "var(--accent-gradient, linear-gradient(135deg,#6366f1,#8b5cf6))", boxShadow: "0 4px 18px var(--accent-glow, rgba(99,102,241,0.35))" }}>
        {isLoading
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
          : <><Save className="h-4 w-4" />Save</>}
      </button>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────── */
const Settings = ({ user, onLogout, onUserUpdate }) => {
  const photoInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const DEFAULTS = {
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    username: user?.email?.split("@")[0] || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    location: user?.location || "",
    occupation: "Student",
    education: user?.major || "",
    emailNotifications: true,
    pushNotifications: true,
    lessonReminders: true,
    marketingEmails: false,
    achievementAlerts: true,
    deadlineReminders: true,
    newsletterSubscription: false,
    courseUpdates: true,
    discussionReplies: true,
    mentorMessages: true,
    profileVisibility: "public",
    showProgress: true,
    showAchievements: true,
    allowMessages: "friends",
    showEmail: false,
    showCourses: true,
    showCertificates: true,
    activityStatus: true,
    theme: "system",
    accentColor: "indigo",
    fontSize: "medium",
    fontFamily: "Inter",
    liquidGlass: true,
    glossyReflections: true,
    compactView: false,
    reduceAnimations: false,
    highContrast: false,
    language: "english",
    timezone: "Asia/Phnom_Penh",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    currency: "USD",
    twoFactorAuth: false,
    loginAlerts: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    paymentMethods: [],
    billingAddress: "",
    autoRenewal: false,
    screenReader: false,
    highContrastMode: false,
    reducedMotion: false,
    keyboardNavigation: true,
    captionPreferences: true,
    autoDownload: false,
    downloadQuality: "hd",
    offlineAccess: true,
    storageLimit: "10GB",
    usedStorage: "3.2GB",
  };

  const [settings, setSettings] = useState(() => {
    const saved = loadStoredSettings();
    return {
      ...DEFAULTS,
      ...saved,
      name: user?.name || saved.name || "",
      email: user?.email || saved.email || "",
      avatar: user?.avatar || saved.avatar || "",
      username: saved.username || user?.email?.split("@")[0] || "",
      bio: user?.bio || saved.bio || "",
      phone: user?.phone || saved.phone || "",
      location: user?.location || saved.location || "",
      education: user?.education || user?.major || saved.education || "",
    };
  });
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id || String(user.id).startsWith("user-")) return;

    profileApi
      .getProfile(user.id)
      .then((profile) => {
        if (cancelled) return;
        setSettings((prev) => ({
          ...prev,
          name: profile.name || prev.name,
          email: profile.email || prev.email,
          avatar: profile.avatar || prev.avatar,
          username: prev.username || profile.email?.split("@")[0] || "",
          bio: profile.bio || "",
          phone: profile.phone || "",
          location: profile.location || "",
          occupation: profile.occupation || prev.occupation,
          education: profile.education || profile.major || "",
        }));
      })
      .catch((err) => {
        if (!cancelled) setSettingsError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  /* Apply saved settings on mount and when settings change. */
  useEffect(() => {
    applyAllSettings(settings);
  }, [settings]);

  /* ── change handler — applies immediately + saves ── */
  const handleChange = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      applyAllSettings(next);
      return next;
    });
  };

  const handleToggle = (key) => handleChange(key, !settings[key]);

  const handleResetAppearance = () => {
    const defaults = {
      theme: "system",
      accentColor: "indigo",
      fontSize: "medium",
      fontFamily: "Inter",
      liquidGlass: true,
      glossyReflections: true,
      compactView: false,
      reduceAnimations: false,
      highContrast: false,
    };
    setSettings(prev => {
      const next = { ...prev, ...defaults };
      saveSettings(next);
      applyAllSettings(next);
      return next;
    });
    showSavedMessage("Reset to iOS 26 Liquid Glass defaults!");
  };

  const showSavedMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAvatarSelect = () => {
    photoInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setSettingsError("Profile photo must be smaller than 2MB.");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSettingsError("Please choose an image file.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setAvatarSaving(true);
        setSettingsError("");
        const image = reader.result;
        let updatedProfile = { ...user, avatar: image };

        if (user?.id && !String(user.id).startsWith("user-")) {
          updatedProfile = await profileApi.uploadAvatar(user.id, image);
          syncStoredSession(updatedProfile);
        }

        setSettings((prev) => {
          const next = { ...prev, avatar: updatedProfile.avatar };
          save(next);
          return next;
        });
        onUserUpdate?.(updatedProfile);
        showSavedMessage("Profile photo updated!");
      } catch (err) {
        setSettingsError(err.message);
      } finally {
        setAvatarSaving(false);
        if (photoInputRef.current) photoInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (section) => {
    setIsLoading(true);
    setSettingsError("");

    try {
      if (section === "Profile" && user?.id && !String(user.id).startsWith("user-")) {
        const savedProfile = await profileApi.updateProfile(user.id, {
          name: settings.name,
          email: settings.email,
          phone: settings.phone,
          location: settings.location,
          occupation: settings.occupation,
          education: settings.education,
          bio: settings.bio,
        });
        syncStoredSession(savedProfile);
        onUserUpdate?.(savedProfile);
      }
      saveSettings(settings);
      applyAllSettings(settings);
      showSavedMessage(`${section} settings saved!`);
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile",       label: "Profile",           icon: User,       desc: "Personal information" },
    { id: "appearance",    label: "Appearance",        icon: SettingsIcon, desc: "Theme & display options" },
    { id: "language",      label: "Language & Region", icon: Globe,      desc: "Locale preferences" },
    { id: "payment",       label: "Payment",           icon: CreditCard, desc: "Billing & methods" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@700;800&display=swap');
        .sett-root { font-family: 'DM Sans', sans-serif; background: linear-gradient(160deg,#f8f8ff,#f0f0fe); min-height:100vh; padding-top:96px; padding-bottom:64px; }
        .sett-input { width:100%; padding:10px 14px; border-radius:12px; font-size:14px; border:1.5px solid #e5e7eb; background:#fafafa; outline:none; transition:all 0.15s; font-family:'DM Sans',sans-serif; color:#111827; }
        .sett-input:focus { border-color:#a5b4fc; background:white; box-shadow:0 0 0 3px rgba(165,180,252,0.2); }
        .sett-select { width:100%; padding:10px 14px; border-radius:12px; font-size:14px; border:1.5px solid #e5e7eb; background:#fafafa; outline:none; transition:all 0.15s; font-family:'DM Sans',sans-serif; color:#111827; cursor:pointer; }
        .sett-select:focus { border-color:#a5b4fc; background:white; box-shadow:0 0 0 3px rgba(165,180,252,0.2); }
        .sidebar-btn { width:100%; text-align:left; padding:10px 14px; border-radius:14px; border:none; background:transparent; cursor:pointer; transition:all 0.15s; font-family:'DM Sans',sans-serif; }
        .sidebar-btn:hover { background:var(--accent-light); }
        .sidebar-btn.active { background:var(--accent-light); }
        .content-panel { background:white; border-radius:24px; border:1px solid #f0f0f8; box-shadow:0 2px 20px rgba(0,0,0,0.04); overflow:hidden; }
        .sett-card { background:#fafafa; border-radius:16px; border:1px solid #f0f0f8; padding:16px; }
        .settings-section-header { border-bottom:1px solid #f3f4f6; }
        .settings-theme-option { border:2px solid #e5e7eb; background:#fff; }
        .settings-theme-option.selected { border-color:var(--accent-color); background:var(--accent-light); }
        .settings-theme-label { color:#374151; }
        .settings-theme-option.selected .settings-theme-label { color:var(--accent-color); }
        .settings-empty-state { background:#fff; border:1px solid #f0f0f8; }
        .settings-add-payment { border:1.5px dashed #c7d2fe; color:#4f46e5; background:#fafafe; }
        .settings-autosave { background:#eef2ff; }
        html:not(.dark-mode) .settings-tab-icon { background:#eef2ff !important; }
        html:not(.dark-mode) .settings-tab-icon svg { color:#64748b !important; }
        html:not(.dark-mode) .sidebar-btn.active .settings-tab-icon { background:var(--accent-light) !important; }
        html:not(.dark-mode) .sidebar-btn.active .settings-tab-icon svg { color:var(--accent-color) !important; }
        html:not(.dark-mode) .settings-tab-title { color:#334155 !important; }
        html:not(.dark-mode) .settings-tab-description { color:#7c879e !important; }
        html:not(.dark-mode) .sidebar-btn.active .settings-tab-title { color:var(--accent-color) !important; }
        html:not(.dark-mode) .sidebar-btn.active .settings-tab-description { color:var(--accent-secondary) !important; }
        .section-divider { border-top:1px solid #f3f4f6; margin-top:24px; padding-top:24px; }
        .danger-zone { background:#fff5f5; border-radius:16px; border:1px solid #fecaca; padding:16px; }
        .toast { position:fixed; top:84px; right:20px; z-index:9999; background:white; border:1.5px solid #a7f3d0; border-radius:16px; padding:12px 20px; display:flex; align-items:center; gap:10px; box-shadow:0 8px 32px rgba(16,185,129,0.18); animation:toastIn 0.3s ease; }
        @keyframes toastIn { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }

        /* dark mode for settings page itself */
        html.dark-mode .sett-root { background: #0d0d1a !important; }
        html.dark-mode .content-panel { background: #1a1a35 !important; border-color: #2a2a4a !important; }
        html.dark-mode .sett-card { background: #14142b !important; border-color: #2a2a4a !important; }
        html.dark-mode .sidebar-btn:hover { background: #252545 !important; }
        html.dark-mode .sidebar-btn.active { background: var(--accent-light) !important; }
        html.dark-mode .settings-tab-icon { background:#23274c !important; }
        html.dark-mode .settings-tab-icon svg { color:#a8b1d6 !important; }
        html.dark-mode .sidebar-btn.active .settings-tab-icon { background:var(--accent-light) !important; }
        html.dark-mode .sidebar-btn.active .settings-tab-icon svg { color:var(--accent-color) !important; }
        html.dark-mode .settings-tab-title { color:#d7def7 !important; }
        html.dark-mode .settings-tab-description { color:#8f9aca !important; }
        html.dark-mode .sidebar-btn.active .settings-tab-title { color:var(--accent-color) !important; }
        html.dark-mode .sidebar-btn.active .settings-tab-description { color:#b8c1e6 !important; }
        html.dark-mode .settings-section-header { border-bottom:1px solid #3a3f70 !important; }
        html.dark-mode .settings-input-addon { background:#23274c !important; border-color:#3a3a5c !important; color:#a8b1d6 !important; }
        html.dark-mode .settings-theme-option { background:#14142b !important; border-color:#3a3a5c !important; }
        html.dark-mode .settings-theme-option.selected { background:#252550 !important; border-color:#818cf8 !important; }
        html.dark-mode .settings-theme-label { color:#d7def7 !important; }
        html.dark-mode .settings-theme-option.selected .settings-theme-label { color:#aebcff !important; }
        html.dark-mode .settings-empty-state { background:#10122a !important; border-color:#3a3a5c !important; color:#a8b1d6 !important; }
        html.dark-mode .settings-add-payment { background:#151733 !important; border-color:#6366f1 !important; color:#aebcff !important; }
        html.dark-mode .settings-add-payment:hover { background:#252550 !important; }
        html.dark-mode .settings-autosave { background:#23274c !important; }
        html.dark-mode .sett-input, html.dark-mode .sett-select { background:#1a1a35 !important; border-color:#3a3a5c !important; color:#e8e8f5 !important; }
        html.dark-mode .sett-input:focus, html.dark-mode .sett-select:focus { background:#1e1e3a !important; border-color:#6366f1 !important; }
        html.dark-mode .danger-zone { background: #2a0e0e !important; border-color: #7f1d1d !important; }
        html.dark-mode .toast { background: #1a1a35 !important; border-color: #166534 !important; }

        /* iOS-style liquid glass shared by every Settings tab. */
        .sett-root {
          background:
            radial-gradient(circle at 8% 4%, rgba(99,102,241,.18), transparent 28rem),
            radial-gradient(circle at 94% 14%, rgba(56,189,248,.14), transparent 30rem),
            linear-gradient(145deg,#f8faff 0%,#edf3ff 56%,#f8f5ff 100%) !important;
          background-attachment:fixed !important;
        }
        .content-panel {
          background:rgba(255,255,255,.68) !important;
          border:1px solid rgba(255,255,255,.82) !important;
          box-shadow:0 28px 72px rgba(45,55,100,.14),inset 0 1px 0 rgba(255,255,255,.96) !important;
          backdrop-filter:blur(28px) saturate(160%);
          -webkit-backdrop-filter:blur(28px) saturate(160%);
        }
        .sett-card,.settings-empty-state {
          background:rgba(255,255,255,.60) !important;
          border-color:rgba(100,116,160,.15) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.86);
        }
        .sett-input,.sett-select {
          min-height:44px;
          background:rgba(255,255,255,.66) !important;
          border-color:rgba(100,116,160,.20) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.92);
        }
        .sett-input:focus,.sett-select:focus {
          background:rgba(255,255,255,.94) !important;
          border-color:#818cf8 !important;
          box-shadow:0 0 0 4px rgba(99,102,241,.13),inset 0 1px 0 #fff !important;
        }
        .sidebar-btn:hover { background:rgba(99,102,241,.08) !important; }
        .sidebar-btn.active {
          background:rgba(99,102,241,.12) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.72),0 8px 22px rgba(79,70,229,.08);
        }
        .settings-autosave {
          background:rgba(255,255,255,.58) !important;
          border:1px solid rgba(255,255,255,.72);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.90);
          backdrop-filter:blur(14px) saturate(150%);
        }
        .settings-theme-option {
          min-height:102px;
          background:rgba(255,255,255,.58) !important;
          border-color:rgba(100,116,160,.18) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.88);
        }
        .settings-theme-option.selected {
          background:rgba(224,231,255,.78) !important;
          border-color:var(--accent-color) !important;
          box-shadow:0 10px 28px rgba(79,70,229,.14),inset 0 1px 0 #fff;
        }

        html.dark-mode .sett-root {
          background:
            radial-gradient(circle at 8% 4%,rgba(99,102,241,.22),transparent 30rem),
            radial-gradient(circle at 92% 18%,rgba(14,165,233,.13),transparent 30rem),
            linear-gradient(145deg,#070816 0%,#0c1024 58%,#0d0b1d 100%) !important;
        }
        html.dark-mode .content-panel {
          background:rgba(16,18,42,.78) !important;
          border-color:rgba(165,180,252,.18) !important;
          box-shadow:0 32px 78px rgba(0,0,0,.40),inset 0 1px 0 rgba(255,255,255,.08) !important;
          backdrop-filter:blur(28px) saturate(150%);
          -webkit-backdrop-filter:blur(28px) saturate(150%);
        }
        html.dark-mode .sett-card,
        html.dark-mode .settings-empty-state {
          background:rgba(7,8,22,.48) !important;
          border-color:rgba(165,180,252,.14) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
        }
        html.dark-mode .sett-input,html.dark-mode .sett-select {
          background:rgba(7,8,22,.54) !important;
          border-color:rgba(165,180,252,.20) !important;
          color:#f4f7ff !important;
        }
        html.dark-mode .sett-input:focus,html.dark-mode .sett-select:focus {
          background:rgba(12,15,34,.88) !important;
          border-color:#818cf8 !important;
          box-shadow:0 0 0 4px rgba(129,140,248,.14) !important;
        }
        html.dark-mode .sidebar-btn.active {
          background:rgba(99,102,241,.20) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 10px 26px rgba(0,0,0,.18);
        }
        html.dark-mode .settings-autosave {
          background:rgba(30,34,70,.64) !important;
          border-color:rgba(165,180,252,.14);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.07);
        }
        .appearance-glass-card {
          background:rgba(255,255,255,.72);
          border:1px solid rgba(99,102,241,.20);
          box-shadow:0 4px 24px rgba(99,102,241,.08),inset 0 1px 0 rgba(255,255,255,.82);
          backdrop-filter:blur(20px) saturate(150%);
          -webkit-backdrop-filter:blur(20px) saturate(150%);
        }
        .appearance-toggle-card { border-color:rgba(100,116,160,.18); }
        .appearance-specimen-title { color:#111827; }
        .appearance-specimen-copy { color:#4b5563; }
        .appearance-specimen-input {
          border:1.5px solid rgba(99,102,241,.30);
          background:rgba(255,255,255,.80);
          color:#374151;
        }
        .appearance-toggle-divider { border-color:rgba(100,116,160,.18) !important; }
        .settings-toggle-label { color:#334155 !important; }
        .settings-toggle-description { color:#7c879e !important; }
        .settings-toggle-track { background:#dbe4f0; }
        .group:hover .settings-toggle-label { color:#4f46e5 !important; }
        html.dark-mode .appearance-glass-card {
          background:rgba(15,18,43,.66);
          border-color:rgba(129,140,248,.26);
          box-shadow:0 16px 38px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.07);
        }
        html.dark-mode .appearance-specimen-title { color:#f4f7ff; }
        html.dark-mode .appearance-specimen-copy { color:#a8b1d6; }
        html.dark-mode .appearance-specimen-input {
          background:rgba(7,8,22,.54);
          border-color:rgba(129,140,248,.32);
          color:#e8ecff;
        }
        html.dark-mode .appearance-toggle-divider { border-color:rgba(165,180,252,.16) !important; }
        html.dark-mode .settings-toggle-label { color:#e8edff !important; }
        html.dark-mode .settings-toggle-description { color:#9ba7d1 !important; }
        html.dark-mode .settings-toggle-track { background:#343b61; }
        html.dark-mode .group:hover .settings-toggle-label { color:#aebcff !important; }

        @media (max-width: 640px) {
          .settings-page-heading { align-items:flex-start !important; gap:14px; flex-wrap:wrap; }
          .settings-autosave { align-self:flex-start; max-width:100%; }
          .sett-root { padding-top:max(84px,calc(68px + env(safe-area-inset-top))); padding-bottom:max(28px,env(safe-area-inset-bottom)); }
          .settings-main-panel { padding:20px 16px !important; border-radius:24px !important; }
          .settings-section-header { gap:12px; margin-bottom:22px !important; }
          .settings-section-header button { padding:10px 14px !important; margin-left:0 !important; }
          .settings-theme-option { padding:12px 6px !important; }
          .toast { left:12px; right:12px; top:max(76px,calc(64px + env(safe-area-inset-top))); }
        }

        @media (max-width:1023px) {
          .settings-layout { gap:14px !important; }
          .settings-layout > .lg\\:w-72 { width:100%; }
          .settings-sidebar { position:static !important; padding:8px !important; border-radius:22px !important; }
          .settings-sidebar nav { display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; padding-bottom:1px; }
          .settings-sidebar nav::-webkit-scrollbar { display:none; }
          .settings-sidebar nav .sidebar-btn { width:auto !important; min-width:154px; flex:0 0 auto; padding:9px 11px !important; }
          .settings-signout { display:none; }
        }
      `}</style>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: "none" }}
      />

      {showSuccess && (
        <div className="toast">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#ecfdf5" }}>
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="sett-root">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="settings-page-heading flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-1">Account</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.25rem", fontWeight: 700, color: "inherit", lineHeight: 1.2 }}>Settings</h1>
              <p className="text-gray-500 mt-1">Manage your preferences and account configuration</p>
            </div>
            <div className="settings-autosave flex items-center gap-2 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-700">Auto-save on</span>
            </div>
          </div>

          {settingsError && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {settingsError}
            </div>
          )}

          <div className="settings-layout flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="settings-sidebar content-panel p-3 sticky top-24">
                <nav className="space-y-0.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`sidebar-btn ${isActive ? "active" : ""}`}>
                        <div className="flex items-center gap-3">
                          <div className="settings-tab-icon w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: isActive ? "var(--accent-light)" : "#f3f4f6" }}>
                            <Icon className="h-4 w-4" style={{ color: isActive ? "var(--accent-color)" : "#9ca3af" }} />
                          </div>
                          <div className="text-left">
                            <p className="settings-tab-title text-sm font-semibold" style={{ color: isActive ? "var(--accent-color)" : "#374151" }}>{tab.label}</p>
                            <p className="settings-tab-description text-xs text-gray-400">{tab.desc}</p>
                          </div>
                          {isActive && <div className="ml-auto w-1.5 h-5 rounded-full" style={{ background: "var(--accent-color)" }} />}
                        </div>
                      </button>
                    );
                  })}
                </nav>
                <div className="settings-signout mt-3 pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
                  <button onClick={onLogout} className="sidebar-btn hover:bg-red-50 w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#fff5f5" }}>
                        <LogOut className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-600">Sign Out</p>
                        <p className="text-xs text-red-400">Log out of your account</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main panel */}
            <div className="flex-1 min-w-0">
              <div className="settings-main-panel content-panel p-6 sm:p-8">

                {/* PROFILE */}
                {activeTab === "profile" && (
                  <div>
                    <SectionHeader title="Profile Settings" description="Update your personal information" onSave={() => handleSave("Profile")} isLoading={isLoading} />
                    <div className="space-y-5 max-w-2xl">
                      <div className="flex items-center gap-5 p-4 rounded-2xl sett-card">
                        <img src={settings.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(settings.name)}&background=6366f1&color=fff&size=128`}
                          alt={settings.name} className="w-16 h-16 rounded-2xl object-cover"
                          style={{ boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }} />
                        <div>
                          <button
                            type="button"
                            onClick={handleAvatarSelect}
                            disabled={avatarSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                            style={{ background: "var(--accent-gradient)" }}
                          >
                            {avatarSaving
                              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading...</>
                              : <><Upload className="h-4 w-4" />Upload Photo</>}
                          </button>
                          <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or GIF · Max 2MB</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name"><input className="sett-input" type="text" value={settings.name} onChange={e => handleChange("name", e.target.value)} /></Field>
                        <Field label="Username">
                          <div className="flex">
                            <span className="settings-input-addon flex items-center px-3 rounded-l-xl text-sm text-gray-500" style={{ background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRight: "none" }}>@</span>
                            <input className="sett-input" style={{ borderRadius: "0 12px 12px 0" }} type="text" value={settings.username} onChange={e => handleChange("username", e.target.value)} />
                          </div>
                        </Field>
                        <Field label="Email Address"><input className="sett-input" type="email" value={settings.email} onChange={e => handleChange("email", e.target.value)} /></Field>
                        <Field label="Phone Number"><input className="sett-input" type="tel" value={settings.phone} onChange={e => handleChange("phone", e.target.value)} /></Field>
                        <Field label="Location"><input className="sett-input" type="text" value={settings.location} onChange={e => handleChange("location", e.target.value)} /></Field>
                        <Field label="Occupation"><input className="sett-input" type="text" value={settings.occupation} onChange={e => handleChange("occupation", e.target.value)} /></Field>
                      </div>
                      <Field label="Bio">
                        <textarea className="sett-input" rows={3} style={{ resize: "none" }} value={settings.bio} onChange={e => handleChange("bio", e.target.value)} />
                        <p className="text-xs text-gray-400 mt-1">{settings.bio.length}/500 characters</p>
                      </Field>
                    </div>
                  </div>
                )}

                {/* APPEARANCE */}
                {activeTab === "appearance" && (
                  <div className="space-y-8">
                    <SectionHeader
                      title="Appearance & Interface"
                      description="Customize iOS 26 liquid glass materials, theme modes, ambient accent tint, and display scale."
                      onSave={() => handleSave("Appearance")}
                      isLoading={isLoading}
                      extraActions={
                        <button
                          type="button"
                          onClick={handleResetAppearance}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border"
                          style={{
                            color: "var(--accent-color)",
                            background: "var(--accent-light)",
                            borderColor: "var(--accent-border)"
                          }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset Defaults
                        </button>
                      }
                    />

                    {/* THEME MODE SELECTOR */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "#6b7280" }}>
                        <SunMedium className="w-3.5 h-3.5" style={{ color: "var(--accent-color)" }} />
                        Appearance Mode
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[
                          { id: "light",  icon: Sun,    label: "Light Mode",       desc: "Bright liquid canvas",      bg: "linear-gradient(135deg,#fde68a,#f59e0b)" },
                          { id: "dark",   icon: Moon,   label: "Dark Mode",        desc: "Deep dark specular glass",  bg: "linear-gradient(135deg,#312e81,#6d28d9)" },
                          { id: "system", icon: Laptop, label: "System Dynamic",   desc: "Syncs with OS mode",        bg: "linear-gradient(135deg,#6b7280,#374151)" },
                        ].map(({ id, icon: ThemeIcon, label, desc, bg }) => {
                          const isSelected = settings.theme === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => handleChange("theme", id)}
                              className="relative group p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer overflow-hidden border"
                              style={{
                                background: isSelected ? "rgba(99,102,241,0.10)" : "rgba(255,255,255,0.7)",
                                borderColor: isSelected ? "#6366f1" : "rgba(209,213,219,0.8)",
                                boxShadow: isSelected ? "0 4px 20px rgba(99,102,241,0.18)" : "none",
                                backdropFilter: "blur(16px)"
                              }}
                            >
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ background: "var(--accent-gradient)" }}>
                                  <Check className="w-3 h-3 text-white" style={{ strokeWidth: 3 }} />
                                </div>
                              )}
                              <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center shadow-md transition-transform group-hover:scale-110" style={{ background: bg }}>
                                <ThemeIcon className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-bold" style={{ color: isSelected ? "#4f46e5" : "#1f2937" }}>{label}</p>
                              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* LIQUID ACCENT COLOR TINT */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "#6b7280" }}>
                        <Palette className="w-3.5 h-3.5" style={{ color: "var(--accent-color)" }} />
                        Liquid Accent Tint
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {Object.values(ACCENT_PRESETS).map((acc) => {
                          const isSelected = (settings.accentColor || "indigo") === acc.id;
                          return (
                            <button
                              key={acc.id}
                              type="button"
                              onClick={() => handleChange("accentColor", acc.id)}
                              className="p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border"
                              style={{
                                background: isSelected ? acc.light : "rgba(255,255,255,0.7)",
                                borderColor: isSelected ? acc.color : "rgba(209,213,219,0.7)",
                                boxShadow: isSelected ? `0 4px 16px ${acc.glow}` : "none",
                                transform: isSelected ? "scale(1.03)" : "scale(1)"
                              }}
                            >
                              <div className="relative w-8 h-8 rounded-full mb-2 flex items-center justify-center shadow-md" style={{ background: acc.gradient }}>
                                {isSelected && <Check className="w-4 h-4 text-white" style={{ strokeWidth: 3 }} />}
                              </div>
                              <span className="text-xs font-semibold" style={{ color: isSelected ? acc.color : "#374151" }}>
                                {acc.label.split(" ").pop()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* FONT SIZE & FONT FAMILY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Font Size */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: "#6b7280" }}>
                          <Type className="w-3.5 h-3.5" style={{ color: "var(--accent-color)" }} />
                          Display Font Scale
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(FONT_SIZE_MAP).map(([key, info]) => {
                            const isSelected = settings.fontSize === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => handleChange("fontSize", key)}
                                className="p-3 rounded-xl text-left transition-all cursor-pointer border"
                                style={{
                                  background: isSelected ? "rgba(99,102,241,0.10)" : "rgba(255,255,255,0.7)",
                                  borderColor: isSelected ? "#6366f1" : "rgba(209,213,219,0.7)",
                                  color: isSelected ? "#4f46e5" : "#374151"
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold">{info.label}</span>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--accent-color)" }} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Font Family */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: "#6b7280" }}>
                          <Layers className="w-3.5 h-3.5" style={{ color: "var(--accent-color)" }} />
                          Typography System
                        </label>
                        <select
                          className="sett-select"
                          value={settings.fontFamily || "Inter"}
                          onChange={(e) => handleChange("fontFamily", e.target.value)}
                        >
                          {Object.entries(FONT_FAMILY_MAP).map(([fontKey, fontInfo]) => (
                            <option key={fontKey} value={fontKey}>
                              {fontInfo.name} — {fontInfo.desc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* LIVE SPECIMEN SANDBOX */}
                    <div className="appearance-glass-card p-5 rounded-2xl relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: "var(--accent-color)" }}>
                          <Sparkles className="w-3.5 h-3.5" /> Live iOS 26 Specimen Sandbox
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.12)", color: "#4f46e5" }}>
                          {FONT_FAMILY_MAP[settings.fontFamily]?.name || "Inter"} · {FONT_SIZE_MAP[settings.fontSize]?.label}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="appearance-specimen-title text-base font-bold" style={{ fontFamily: FONT_FAMILY_MAP[settings.fontFamily]?.stack }}>
                          Liquid Glass Visual System
                        </h3>
                        <p className="appearance-specimen-copy text-sm leading-relaxed" style={{ fontFamily: FONT_FAMILY_MAP[settings.fontFamily]?.stack }}>
                          Experience smooth ambient color refractions, responsive typography scaling, and crystal translucency across your entire learning workspace.
                        </p>
                        <div className="flex items-center gap-3 pt-2 flex-wrap">
                          <button
                            type="button"
                            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
                            style={{ background: "var(--accent-gradient)" }}
                          >
                            Interactive Button
                          </button>
                          <input
                            type="text"
                            readOnly
                            value="Specular focus ring glow..."
                            className="appearance-specimen-input flex-1 min-w-0 px-3 py-1.5 text-xs rounded-xl outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* MATERIAL & EXPERIENCE TOGGLES */}
                    <div className="appearance-glass-card appearance-toggle-card rounded-2xl p-4 space-y-1">
                      <ToggleSwitch
                        label="iOS 26 Liquid Glass Translucency"
                        description="Enable multi-layer backdrop blur and specular surface reflections"
                        checked={settings.liquidGlass !== false}
                        onChange={() => handleToggle("liquidGlass")}
                      />
                      <div className="appearance-toggle-divider" style={{ borderTop: "1px solid", margin: "2px 0" }} />
                      <ToggleSwitch
                        label="Glossy Light Reflections"
                        description="Show subtle top-edge highlights on cards and glass panels"
                        checked={settings.glossyReflections !== false}
                        onChange={() => handleToggle("glossyReflections")}
                      />
                      <div className="appearance-toggle-divider" style={{ borderTop: "1px solid", margin: "2px 0" }} />
                      <ToggleSwitch
                        label="Compact View Mode"
                        description="Reduce padding and margins for higher information density"
                        checked={!!settings.compactView}
                        onChange={() => handleToggle("compactView")}
                      />
                      <div className="appearance-toggle-divider" style={{ borderTop: "1px solid", margin: "2px 0" }} />
                      <ToggleSwitch
                        label="Reduce Motion & Animations"
                        description="Minimize transitions and dynamic keyframe effects for accessibility"
                        checked={!!settings.reduceAnimations || !!settings.reducedMotion}
                        onChange={() => handleToggle("reduceAnimations")}
                      />
                      <div className="appearance-toggle-divider" style={{ borderTop: "1px solid", margin: "2px 0" }} />
                      <ToggleSwitch
                        label="High Contrast Mode"
                        description="Enhance border definition and color vibrancy for optimal readability"
                        checked={!!settings.highContrast || !!settings.highContrastMode}
                        onChange={() => handleToggle("highContrast")}
                      />
                    </div>
                  </div>
                )}


                {/* LANGUAGE */}
                {activeTab === "language" && (
                  <div>
                    <SectionHeader title="Language & Region" description="Set your locale preferences" onSave={() => handleSave("Language")} isLoading={isLoading} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                      <Field label="Language">
                        <select className="sett-select" value={settings.language} onChange={e => handleChange("language", e.target.value)}>
                          <option value="english">English (US)</option>
                          <option value="khmer">ភាសាខ្មែរ (Khmer)</option>
                          <option value="spanish">Español</option>
                          <option value="french">Français</option>
                          <option value="chinese">中文</option>
                          <option value="japanese">日本語</option>
                        </select>
                      </Field>
                      <Field label="Timezone">
                        <select className="sett-select" value={settings.timezone} onChange={e => handleChange("timezone", e.target.value)}>
                          <option value="Asia/Phnom_Penh">Asia/Phnom_Penh (UTC+7)</option>
                          <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                          <option value="America/New_York">America/New_York (UTC-5)</option>
                          <option value="Europe/London">Europe/London (UTC+0)</option>
                          <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                        </select>
                      </Field>
                      <Field label="Date Format">
                        <select className="sett-select" value={settings.dateFormat} onChange={e => handleChange("dateFormat", e.target.value)}>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </Field>
                      <Field label="Time Format">
                        <select className="sett-select" value={settings.timeFormat} onChange={e => handleChange("timeFormat", e.target.value)}>
                          <option value="12h">12-hour (AM/PM)</option>
                          <option value="24h">24-hour</option>
                        </select>
                      </Field>
                      <Field label="Currency">
                        <select className="sett-select" value={settings.currency} onChange={e => handleChange("currency", e.target.value)}>
                          <option value="USD">USD — US Dollar</option>
                          <option value="KHR">KHR — Khmer Riel</option>
                          <option value="EUR">EUR — Euro</option>
                          <option value="GBP">GBP — British Pound</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* PAYMENT */}
                {activeTab === "payment" && (
                  <div>
                    <SectionHeader title="Payment Settings" description="Manage billing and payment methods" onSave={() => handleSave("Payment")} isLoading={isLoading} />
                    <div className="space-y-5 max-w-2xl">
                      <div className="sett-card">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Methods</p>
                        <div className="space-y-2">
                          {settings.paymentMethods.map(m => (
                            <div key={m.id} className="settings-empty-state flex items-center justify-between p-3 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#eef2ff" }}>
                                  <CreditCard className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{m.type.charAt(0).toUpperCase() + m.type.slice(1)} •••• {m.last4}</p>
                                  <p className="text-xs text-gray-500">Expires {m.exp}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {m.default && <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>Default</span>}
                                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Edit</button>
                              </div>
                            </div>
                          ))}
                          {settings.paymentMethods.length === 0 && (
                            <p className="settings-empty-state p-3 rounded-xl text-sm text-gray-500">
                              No payment methods saved.
                            </p>
                          )}
                          <button className="settings-add-payment w-full mt-2 py-2.5 rounded-xl text-sm font-semibold transition-all">
                            + Add Payment Method
                          </button>
                        </div>
                      </div>
                      <Field label="Billing Address"><input className="sett-input" type="text" value={settings.billingAddress} onChange={e => handleChange("billingAddress", e.target.value)} /></Field>
                      <div className="sett-card">
                        <ToggleSwitch label="Auto-Renewal" description="Automatically renew your subscription each period" checked={settings.autoRenewal} onChange={() => handleToggle("autoRenewal")} />
                      </div>
                      <div className="sett-card">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billing History</p>
                        <div className="space-y-2">
                          <div className="settings-empty-state flex items-center gap-3 p-3 rounded-xl">
                            <History className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-500">No billing history available.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
