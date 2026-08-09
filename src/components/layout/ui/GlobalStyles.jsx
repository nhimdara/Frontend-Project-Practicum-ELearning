// GlobalStyles.jsx
// Place in: src/components/layout/ui/GlobalStyles.jsx
// Import ONCE in App.jsx — makes ALL settings work on ALL pages
import { useEffect } from "react";

const CSS = `
/* Mobile Menu and Modal Animations */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

.modal-slide-down {
  animation: slideDown 0.3s ease-in forwards;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-tablet-only {
    display: block !important;
  }
}

/* Prevent body scroll when modal is open */
body.modal-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* Touch-friendly tap targets */
@media (max-width: 768px) {
  button, 
  [role="button"],
  a {
    min-height: 44px;
    min-width: 44px;
  }
}
/* Base font settings */
:root {
  --lf-primary: #4f46e5;
  --lf-primary-strong: #4338ca;
  --lf-accent: #06b6d4;
  --lf-success: #10b981;
  --lf-warning: #f59e0b;
  --lf-danger: #ef4444;
  --lf-light-bg: #f7f9ff;
  --lf-light-bg-soft: #eef4ff;
  --lf-light-card: #ffffff;
  --lf-light-border: #dbe4f0;
  --lf-light-text: #0f172a;
  --lf-light-muted: #64748b;
  --lf-dark-bg: #070816;
  --lf-dark-bg-soft: #10122a;
  --lf-dark-card: #151733;
  --lf-dark-card-strong: #1c1f42;
  --lf-dark-border: #2b315f;
  --lf-dark-text: #f4f7ff;
  --lf-dark-muted: #a8b1d6;
}

html {
  font-size: var(--app-font-size, 15px) !important;
  background: var(--lf-light-bg);
  color-scheme: light;
}

body, button, input, select, textarea {
  font-family: var(--app-font-family, 'DM Sans', sans-serif) !important;
}

body {
  background:
    radial-gradient(circle at top left, rgba(79, 70, 229, 0.10), transparent 32rem),
    radial-gradient(circle at top right, rgba(6, 182, 212, 0.09), transparent 30rem),
    linear-gradient(180deg, #fbfdff 0%, var(--lf-light-bg) 100%) !important;
  color: var(--lf-light-text);
}

::selection {
  background: rgba(79, 70, 229, 0.22);
  color: #1e1b4b;
}

button,
a,
input,
select,
textarea {
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--lf-primary) !important;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.14) !important;
}

/* Light mode polish */
html:not(.dark-mode) .bg-white {
  background-color: rgba(255, 255, 255, 0.92) !important;
}

html:not(.dark-mode) .bg-gray-50,
html:not(.dark-mode) .bg-slate-50 {
  background-color: #f8fbff !important;
}

html:not(.dark-mode) .border,
html:not(.dark-mode) .border-gray-100,
html:not(.dark-mode) .border-gray-200,
html:not(.dark-mode) .border-slate-100,
html:not(.dark-mode) .border-slate-200 {
  border-color: var(--lf-light-border) !important;
}

html:not(.dark-mode) .shadow,
html:not(.dark-mode) .shadow-md,
html:not(.dark-mode) .shadow-lg,
html:not(.dark-mode) .shadow-xl {
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08) !important;
}

html:not(.dark-mode) .text-indigo-600,
html:not(.dark-mode) .text-indigo-700 {
  color: var(--lf-primary) !important;
}

html:not(.dark-mode) .bg-indigo-600,
html:not(.dark-mode) .bg-indigo-700 {
  background-color: var(--lf-primary) !important;
}

html:not(.dark-mode) .bg-gradient-to-r.from-indigo-600,
html:not(.dark-mode) .bg-gradient-to-br.from-indigo-500,
html:not(.dark-mode) .bg-gradient-to-br.from-indigo-600 {
  filter: saturate(1.08);
}

/* === DARK MODE === */
html.dark-mode {
  color-scheme: dark;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.20), transparent 28rem),
    radial-gradient(circle at top right, rgba(6, 182, 212, 0.16), transparent 30rem),
    linear-gradient(180deg, #070816 0%, #0d1024 100%);
}

html.dark-mode body {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.20), transparent 28rem),
    radial-gradient(circle at top right, rgba(6, 182, 212, 0.16), transparent 30rem),
    linear-gradient(180deg, #070816 0%, #0d1024 100%) !important;
  color: var(--lf-dark-text) !important;
}

html.dark-mode .min-h-screen {
  background: transparent !important;
}

/* Hero images - ensure they're visible with beautiful dark mode filter */
html.dark-mode img[alt*="Banner"],
html.dark-mode img[alt*="banner"],
html.dark-mode .hero-bg,
html.dark-mode img[alt="EduLearn campus"],
html.dark-mode img[alt="Calendar Banner"],
html.dark-mode img[alt="Lesson Banner"],
html.dark-mode img[alt="Project Showcase"] {
  opacity: 1 !important;
  filter: brightness(0.6) saturate(1.2) contrast(1.1);
}

/* Overlay adjustments for dark mode - more dramatic */
html.dark-mode .bg-black\\/60,
html.dark-mode [class*="bg-black/"] {
  background-color: rgba(0, 0, 0, 0.75) !important;
}

/* Background colors */
html.dark-mode .bg-white {
  background-color: var(--lf-dark-card) !important;
}

html.dark-mode .bg-gray-50 {
  background-color: #10122a !important;
}

html.dark-mode .bg-gray-100 {
  background-color: #181b38 !important;
}

html.dark-mode .bg-gray-200 {
  background-color: #23274c !important;
}

html.dark-mode .bg-slate-50,
html.dark-mode .bg-slate-100 {
  background-color: #10122a !important;
}

html.dark-mode .bg-slate-800 {
  background-color: #1b2142 !important;
}

html.dark-mode .bg-slate-900,
html.dark-mode .bg-slate-950 {
  background-color: #080a18 !important;
}

/* Border colors */
html.dark-mode .border,
html.dark-mode .border-gray-50,
html.dark-mode .border-gray-100,
html.dark-mode .border-gray-200,
html.dark-mode .border-gray-300,
html.dark-mode .border-slate-100,
html.dark-mode .border-slate-200,
html.dark-mode .border-slate-700,
html.dark-mode .border-slate-800 {
  border-color: var(--lf-dark-border) !important;
}

html.dark-mode .border-b { border-bottom-color: var(--lf-dark-border) !important; }
html.dark-mode .border-t { border-top-color: var(--lf-dark-border) !important; }

html.dark-mode .divide-y > * + * { border-top-color: var(--lf-dark-border) !important; }

/* Text colors - elegant dark mode palette */
html.dark-mode .text-gray-900,
html.dark-mode .text-slate-950,
html.dark-mode .text-slate-900 { color: var(--lf-dark-text) !important; }
html.dark-mode .text-gray-800,
html.dark-mode .text-slate-800 { color: #e8edff !important; }
html.dark-mode .text-gray-700,
html.dark-mode .text-slate-700 { color: #d7def7 !important; }
html.dark-mode .text-gray-600,
html.dark-mode .text-slate-600 { color: #c3cbed !important; }
html.dark-mode .text-gray-500,
html.dark-mode .text-slate-500 { color: var(--lf-dark-muted) !important; }
html.dark-mode .text-gray-400,
html.dark-mode .text-slate-400 { color: #8f9aca !important; }

/* Primary colors - keep vibrant */
html.dark-mode .text-indigo-600,
html.dark-mode .text-indigo-700,
html.dark-mode .text-indigo-400 { color: #aebcff !important; }

html.dark-mode .text-blue-600,
html.dark-mode .text-blue-700 { color: #93c5fd !important; }

html.dark-mode .text-cyan-600,
html.dark-mode .text-cyan-700 { color: #67e8f9 !important; }

html.dark-mode .text-teal-600 { color: #5eead4 !important; }

html.dark-mode .text-emerald-600,
html.dark-mode .text-green-600,
html.dark-mode .text-green-700 { color: #6ee7b7 !important; }

html.dark-mode .text-amber-600,
html.dark-mode .text-yellow-600 { color: #fcd34d !important; }

html.dark-mode .text-orange-600 { color: #fb923c !important; }

html.dark-mode .text-red-600,
html.dark-mode .text-rose-600 { color: #fca5a5 !important; }

html.dark-mode .text-purple-600,
html.dark-mode .text-violet-600 { color: #c4b5fd !important; }

html.dark-mode .bg-indigo-600,
html.dark-mode .bg-indigo-700 {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
}

html.dark-mode .hover\\:bg-indigo-50:hover {
  background-color: rgba(99, 102, 241, 0.16) !important;
}

/* Gradient backgrounds for dark mode */
html.dark-mode .bg-gradient-to-r.from-indigo-600.to-violet-600,
html.dark-mode .bg-gradient-to-r.from-cyan-600.to-indigo-600,
html.dark-mode .bg-gradient-to-r.from-emerald-600.to-teal-600,
html.dark-mode .bg-gradient-to-r.from-amber-500.to-orange-600 {
  filter: brightness(1.1) saturate(1.2);
}

/* Card hover effects */
html.dark-mode .hover\\:shadow-xl:hover {
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2) !important;
}

/* Stats cards & glass morphism */
html.dark-mode [class*="stat-card"],
html.dark-mode .glass-card {
  background: rgba(21, 23, 51, 0.78) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(165, 180, 252, 0.18);
}

html.dark-mode .rounded-xl.border,
html.dark-mode .rounded-2xl.border,
html.dark-mode .rounded-3xl.border,
html.dark-mode .admin-card,
html.dark-mode .admin-panel,
html.dark-mode .certificate-card,
html.dark-mode .exam-panel,
html.dark-mode .exam-intro,
html.dark-mode .exam-rules,
html.dark-mode .result-panel {
  background-color: var(--lf-dark-card) !important;
  border-color: var(--lf-dark-border) !important;
  color: var(--lf-dark-text) !important;
}

html.dark-mode .exam-title,
html.dark-mode .exam-intro-title,
html.dark-mode .question-text {
  color: var(--lf-dark-text) !important;
}

html.dark-mode .exam-subtitle,
html.dark-mode .exam-intro-subtitle,
html.dark-mode .exam-rules li,
html.dark-mode .exam-hint {
  color: var(--lf-dark-muted) !important;
}

/* Form inputs */
html.dark-mode input:not([type=checkbox]):not([type=radio]),
html.dark-mode select,
html.dark-mode textarea {
  background-color: #12152e !important;
  border-color: var(--lf-dark-border) !important;
  color: var(--lf-dark-text) !important;
}

html.dark-mode input::placeholder,
html.dark-mode textarea::placeholder {
  color: #7e89bd !important;
}

/* Table styles */
html.dark-mode table {
  background-color: #1a1a35 !important;
}

html.dark-mode thead tr {
  background-color: #14142b !important;
}

html.dark-mode th {
  color: #9999cc !important;
  border-color: #2a2a4a !important;
}

html.dark-mode td {
  color: #b8b8d8 !important;
  border-color: #2a2a4a !important;
}

html.dark-mode tbody tr:hover {
  background-color: #202040 !important;
}

/* Colored backgrounds */
html.dark-mode .bg-indigo-50,
html.dark-mode .bg-indigo-100 { background-color: #1e1b3a !important; }

html.dark-mode .bg-blue-50,
html.dark-mode .bg-blue-100 { background-color: #0e1a38 !important; }

html.dark-mode .bg-cyan-50,
html.dark-mode .bg-cyan-100 { background-color: #0e2230 !important; }

html.dark-mode .bg-emerald-50,
html.dark-mode .bg-emerald-100,
html.dark-mode .bg-green-50,
html.dark-mode .bg-green-100 { background-color: #0e2a1e !important; }

html.dark-mode .bg-amber-50,
html.dark-mode .bg-amber-100,
html.dark-mode .bg-yellow-50,
html.dark-mode .bg-yellow-100 { background-color: #2a1a08 !important; }

html.dark-mode .bg-orange-50,
html.dark-mode .bg-orange-100 { background-color: #2a1408 !important; }

html.dark-mode .bg-red-50,
html.dark-mode .bg-red-100,
html.dark-mode .bg-rose-50,
html.dark-mode .bg-rose-100 { background-color: #2a0e0e !important; }

html.dark-mode .bg-purple-50,
html.dark-mode .bg-purple-100,
html.dark-mode .bg-violet-50,
html.dark-mode .bg-violet-100 { background-color: #1e1430 !important; }

/* Navigation and footer */
html.dark-mode nav {
  background:
    linear-gradient(90deg, rgba(10, 12, 30, 0.96), rgba(38, 20, 74, 0.94)) !important;
  border-bottom-color: var(--lf-dark-border) !important;
}

html.dark-mode footer {
  background-color: #0d1024 !important;
  border-top-color: var(--lf-dark-border) !important;
}

/* Hover states */
html.dark-mode .hover\\:bg-gray-50:hover {
  background-color: #1e1e38 !important;
}

html.dark-mode .hover\\:bg-gray-100:hover {
  background-color: #252545 !important;
}

html.dark-mode .hover\\:bg-indigo-50:hover {
  background-color: #252550 !important;
}

/* Shadows - more subtle in dark mode */
html.dark-mode .shadow-sm,
html.dark-mode .shadow,
html.dark-mode .shadow-md,
html.dark-mode .shadow-lg,
html.dark-mode .shadow-xl,
html.dark-mode .shadow-2xl {
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45) !important;
}

/* Particle effects - make them glow more in dark mode */
html.dark-mode canvas {
  opacity: 0.8;
  filter: brightness(1.2);
}

/* Scrollbar for dark mode */
html.dark-mode ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

html.dark-mode ::-webkit-scrollbar-track {
  background: #1a1a30;
}

html.dark-mode ::-webkit-scrollbar-thumb {
  background: #3a3a60;
  border-radius: 5px;
}

html.dark-mode ::-webkit-scrollbar-thumb:hover {
  background: #4a4a80;
}

/* Level badges */
html.dark-mode .bg-green-100 { 
  background-color: rgba(16, 185, 129, 0.2) !important; 
  color: #6ee7b7 !important;
}

html.dark-mode .bg-yellow-100 { 
  background-color: rgba(245, 158, 11, 0.2) !important; 
  color: #fcd34d !important;
}

html.dark-mode .bg-red-100 { 
  background-color: rgba(239, 68, 68, 0.2) !important; 
  color: #fca5a5 !important;
}

/* Keep white text white */
html.dark-mode .text-white {
  color: #ffffff !important;
}

html.dark-mode .text-white\\/70 {
  color: rgba(255, 255, 255, 0.7) !important;
}

html.dark-mode .text-white\\/80 {
  color: rgba(255, 255, 255, 0.8) !important;
}

html.dark-mode .text-white\\/90 {
  color: rgba(255, 255, 255, 0.9) !important;
}

html.dark-mode ::selection {
  background: rgba(129, 140, 248, 0.35);
  color: #ffffff;
}

/* === FULL SITE PAGE POLISH === */
html:not(.dark-mode) .prof-root,
html:not(.dark-mode) .sett-root {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.13), transparent 32rem),
    radial-gradient(circle at top right, rgba(6, 182, 212, 0.10), transparent 30rem),
    linear-gradient(160deg, #fbfdff, #eef4ff) !important;
}

html.dark-mode .prof-root,
html.dark-mode .sett-root {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 30rem),
    radial-gradient(circle at top right, rgba(6, 182, 212, 0.15), transparent 28rem),
    linear-gradient(160deg, #070816, #10122a) !important;
  color: var(--lf-dark-text) !important;
}

html:not(.dark-mode) .prof-card,
html:not(.dark-mode) .content-panel,
html:not(.dark-mode) .sett-card,
html:not(.dark-mode) .modal-panel {
  background: rgba(255, 255, 255, 0.94) !important;
  border-color: #dbe4f0 !important;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08) !important;
}

html:not(.dark-mode) .admin-page-body .rounded-2xl.border,
html:not(.dark-mode) .teacher-stats-grid > div,
html:not(.dark-mode) .teacher-video-grid > div,
html:not(.dark-mode) .teacher-lessons-grid > div {
  background: var(--ios-glass-light) !important;
  border-color: rgba(255,255,255,0.76) !important;
  box-shadow: var(--ios-glass-shadow), inset 0 1px 0 rgba(255,255,255,0.86) !important;
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
}

html.dark-mode .prof-card,
html.dark-mode .content-panel,
html.dark-mode .sett-card,
html.dark-mode .modal-panel,
html.dark-mode .success-toast,
html.dark-mode .toast {
  background: rgba(21, 23, 51, 0.96) !important;
  border-color: var(--lf-dark-border) !important;
  color: var(--lf-dark-text) !important;
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.42) !important;
}

html.dark-mode .prof-card *,
html.dark-mode .content-panel *,
html.dark-mode .sett-card *,
html.dark-mode .modal-panel * {
  border-color: var(--lf-dark-border);
}

html.dark-mode .form-field,
html.dark-mode .sett-input,
html.dark-mode .sett-select {
  background: #10142e !important;
  border-color: var(--lf-dark-border) !important;
  color: var(--lf-dark-text) !important;
}

html:not(.dark-mode) .form-field,
html:not(.dark-mode) .sett-input,
html:not(.dark-mode) .sett-select {
  background: #ffffff !important;
  border-color: #dbe4f0 !important;
  color: var(--lf-light-text) !important;
}

html.dark-mode .tab-btn:not(.active),
html.dark-mode .sidebar-btn:not(.active),
html.dark-mode .ghost-btn {
  color: var(--lf-dark-muted) !important;
}

html.dark-mode .tab-btn.active,
html.dark-mode .sidebar-btn.active,
html.dark-mode .skill-chip {
  background: rgba(99, 102, 241, 0.18) !important;
  color: #c7d2fe !important;
  border-color: rgba(129, 140, 248, 0.36) !important;
}

html.dark-mode .ghost-btn {
  background: #10142e !important;
  border-color: var(--lf-dark-border) !important;
}

html.dark-mode .primary-btn,
html:not(.dark-mode) .primary-btn,
html:not(.dark-mode) button[class*="bg-indigo-600"],
html.dark-mode button[class*="bg-indigo-600"] {
  background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
  color: #ffffff !important;
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.24) !important;
}

html:not(.dark-mode) a[class*="text-gray-"],
html:not(.dark-mode) button[class*="text-gray-"] {
  color: #475569;
}

html.dark-mode a[class*="text-gray-"],
html.dark-mode button[class*="text-gray-"] {
  color: var(--lf-dark-muted);
}

html:not(.dark-mode) table {
  background: #ffffff !important;
}

html:not(.dark-mode) thead tr {
  background: #f1f5ff !important;
}

html:not(.dark-mode) th {
  color: #475569 !important;
  border-color: #dbe4f0 !important;
}

html:not(.dark-mode) td {
  color: #334155 !important;
  border-color: #e5edf7 !important;
}

html:not(.dark-mode) tbody tr:hover {
  background: #f8fbff !important;
}

html.dark-mode .bg-gradient-to-b.from-slate-50,
html.dark-mode .bg-gradient-to-b.from-gray-50,
html.dark-mode .bg-gradient-to-br.from-indigo-50,
html.dark-mode .bg-gradient-to-br.from-gray-50,
html.dark-mode .bg-gradient-to-br.from-white {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.20), transparent 30rem),
    linear-gradient(180deg, #070816, #10122a) !important;
}

html:not(.dark-mode) .bg-gradient-to-b.from-slate-50,
html:not(.dark-mode) .bg-gradient-to-b.from-gray-50,
html:not(.dark-mode) .bg-gradient-to-br.from-indigo-50,
html:not(.dark-mode) .bg-gradient-to-br.from-gray-50,
html:not(.dark-mode) .bg-gradient-to-br.from-white {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.10), transparent 30rem),
    radial-gradient(circle at top right, rgba(6, 182, 212, 0.08), transparent 28rem),
    linear-gradient(180deg, #fbfdff, #eef4ff) !important;
}

html.dark-mode [class*="bg-gray-50/"],
html.dark-mode [class*="bg-slate-50/"] {
  background-color: rgba(21, 23, 51, 0.82) !important;
}

html:not(.dark-mode) .text-transparent.bg-clip-text {
  filter: saturate(1.15);
}

html.dark-mode .text-transparent.bg-clip-text {
  filter: brightness(1.18) saturate(1.2);
}

html.dark-mode .dark\\:bg-\\[\\#1a1a35\\] {
  background-color: #151733 !important;
}

html.dark-mode .dark\\:bg-\\[\\#252545\\] {
  background-color: #1c1f42 !important;
}

html.dark-mode .dark\\:border-\\[\\#2a2a4a\\] {
  border-color: var(--lf-dark-border) !important;
}

html.dark-mode .dark\\:text-white {
  color: #ffffff !important;
}

html.dark-mode .dark\\:text-gray-300,
html.dark-mode .dark\\:text-gray-400,
html.dark-mode .dark\\:text-gray-500 {
  color: var(--lf-dark-muted) !important;
}

html.dark-mode .danger-zone {
  background: rgba(127, 29, 29, 0.22) !important;
  border-color: rgba(248, 113, 113, 0.32) !important;
}

html:not(.dark-mode) .danger-zone {
  background: #fff5f5 !important;
  border-color: #fecaca !important;
}

html.dark-mode .bg-red-100,
html.dark-mode .bg-red-50 {
  color: #fecaca !important;
}

html:not(.dark-mode) .bg-red-100,
html:not(.dark-mode) .bg-red-50 {
  color: #991b1b !important;
}

html:not(.dark-mode) ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

html:not(.dark-mode) ::-webkit-scrollbar-track {
  background: #eaf0fb;
}

html:not(.dark-mode) ::-webkit-scrollbar-thumb {
  background: #b9c6e3;
  border-radius: 999px;
}

html:not(.dark-mode) ::-webkit-scrollbar-thumb:hover {
  background: #8fa2d4;
}

/* === LIQUID GLASS DESIGN SYSTEM === */
:root {
  --ios-glass-light: rgba(255, 255, 255, 0.72);
  --ios-glass-light-strong: rgba(255, 255, 255, 0.88);
  --ios-glass-dark: rgba(21, 23, 51, 0.72);
  --ios-glass-dark-strong: rgba(21, 23, 51, 0.88);
  --ios-glass-border-light: rgba(255, 255, 255, 0.78);
  --ios-glass-border-dark: rgba(165, 180, 252, 0.18);
  --ios-glass-shadow: 0 24px 64px rgba(38, 45, 91, 0.14);
  --ios-glass-shadow-dark: 0 28px 70px rgba(0, 0, 0, 0.38);
}

html:not(.dark-mode) body {
  background:
    radial-gradient(circle at 8% 8%, rgba(99,102,241,0.16), transparent 29rem),
    radial-gradient(circle at 92% 18%, rgba(56,189,248,0.13), transparent 28rem),
    radial-gradient(circle at 52% 92%, rgba(168,85,247,0.10), transparent 34rem),
    linear-gradient(145deg, #f7f9ff 0%, #edf3ff 55%, #f8f5ff 100%) !important;
  background-attachment: fixed !important;
}

html.dark-mode body {
  background:
    radial-gradient(circle at 8% 8%, rgba(99,102,241,0.22), transparent 30rem),
    radial-gradient(circle at 92% 20%, rgba(14,165,233,0.13), transparent 30rem),
    radial-gradient(circle at 52% 96%, rgba(126,34,206,0.12), transparent 35rem),
    linear-gradient(145deg, #070816 0%, #0c1024 55%, #0d0b1d 100%) !important;
  background-attachment: fixed !important;
}

html:not(.dark-mode) .ui-card,
html:not(.dark-mode) .prof-card,
html:not(.dark-mode) .content-panel,
html:not(.dark-mode) .sett-card,
html:not(.dark-mode) .modal-panel {
  background: var(--ios-glass-light) !important;
  border-color: var(--ios-glass-border-light) !important;
  box-shadow: var(--ios-glass-shadow), inset 0 1px 0 rgba(255,255,255,0.88) !important;
  backdrop-filter: blur(24px) saturate(155%);
  -webkit-backdrop-filter: blur(24px) saturate(155%);
}

html.dark-mode .ui-card,
html.dark-mode .prof-card,
html.dark-mode .content-panel,
html.dark-mode .sett-card,
html.dark-mode .modal-panel {
  background: var(--ios-glass-dark) !important;
  border-color: var(--ios-glass-border-dark) !important;
  box-shadow: var(--ios-glass-shadow-dark), inset 0 1px 0 rgba(255,255,255,0.08) !important;
  backdrop-filter: blur(24px) saturate(145%);
  -webkit-backdrop-filter: blur(24px) saturate(145%);
}

html.dark-mode .admin-page-body .rounded-2xl.border,
html.dark-mode .teacher-stats-grid > div,
html.dark-mode .teacher-video-grid > div,
html.dark-mode .teacher-lessons-grid > div {
  background: var(--ios-glass-dark) !important;
  border-color: var(--ios-glass-border-dark) !important;
  box-shadow: var(--ios-glass-shadow-dark), inset 0 1px 0 rgba(255,255,255,0.07) !important;
  backdrop-filter: blur(22px) saturate(145%);
  -webkit-backdrop-filter: blur(22px) saturate(145%);
}

.ui-card,
.prof-card,
.content-panel,
.sett-card,
.modal-panel,
.admin-page-body .rounded-2xl,
.teacher-dashboard-root .teacher-settings-card {
  border-radius: 22px !important;
}

button[class*="rounded"],
.ui-button,
.primary-btn,
.ghost-btn,
.tab-btn,
.sidebar-btn {
  transform: translateZ(0);
}

button[class*="rounded"]:active,
.ui-button:active,
.primary-btn:active,
.ghost-btn:active,
.tab-btn:active,
.sidebar-btn:active {
  transform: scale(0.975);
}

html:not(.dark-mode) .sett-input,
html:not(.dark-mode) .sett-select,
html:not(.dark-mode) .form-field {
  background: rgba(255,255,255,0.68) !important;
  border-color: rgba(148,163,184,0.28) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.85) !important;
  backdrop-filter: blur(12px);
}

html.dark-mode .sett-input,
html.dark-mode .sett-select,
html.dark-mode .form-field {
  background: rgba(7,8,22,0.46) !important;
  border-color: rgba(165,180,252,0.20) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05) !important;
}

@media (max-width: 768px) {
  .ui-card,
  .prof-card,
  .content-panel,
  .sett-card,
  .modal-panel {
    border-radius: 18px !important;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  html:not(.dark-mode) .ui-card,
  html:not(.dark-mode) .prof-card,
  html:not(.dark-mode) .content-panel,
  html:not(.dark-mode) .sett-card,
  html:not(.dark-mode) .modal-panel {
    background: var(--ios-glass-light-strong) !important;
  }

  html.dark-mode .ui-card,
  html.dark-mode .prof-card,
  html.dark-mode .content-panel,
  html.dark-mode .sett-card,
  html.dark-mode .modal-panel {
    background: var(--ios-glass-dark-strong) !important;
  }
}

/* Navbar materials need explicit states so white glass never meets white text. */
html:not(.dark-mode) nav.app-navbar.app-navbar-top {
  background: rgba(17, 24, 54, 0.74) !important;
  border-color: rgba(255,255,255,0.16) !important;
  box-shadow: 0 12px 36px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.10) !important;
}

html:not(.dark-mode) nav.app-navbar.app-navbar-scrolled {
  background: rgba(248,250,255,0.88) !important;
  border-color: rgba(255,255,255,0.72) !important;
}

html:not(.dark-mode) nav.app-navbar.app-navbar-scrolled .app-nav-control {
  color: #334155 !important;
  background: rgba(255,255,255,0.54) !important;
  box-shadow: inset 0 0 0 1px rgba(148,163,184,0.16);
}

html:not(.dark-mode) nav.app-navbar.app-navbar-top .app-nav-control,
html.dark-mode nav.app-navbar .app-nav-control {
  color: #ffffff !important;
}

html.dark-mode nav.app-navbar {
  background: rgba(7,8,22,0.76) !important;
  border-color: rgba(165,180,252,0.15) !important;
}

nav.app-navbar .mobile-nav-sheet {
  background: rgba(15,23,42,0.88) !important;
  border-color: rgba(165,180,252,0.14) !important;
  box-shadow: 0 24px 54px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
  backdrop-filter: blur(28px) saturate(150%);
  -webkit-backdrop-filter: blur(28px) saturate(150%);
}

nav.app-navbar .mobile-nav-link {
  color: #d7def7 !important;
  border: 1px solid transparent;
}

nav.app-navbar .mobile-nav-link:hover,
nav.app-navbar .mobile-nav-link:focus-visible {
  background: rgba(255,255,255,0.08) !important;
  border-color: rgba(255,255,255,0.08);
  color: #ffffff !important;
}

nav.app-navbar .mobile-nav-link.is-active {
  background: rgba(99,102,241,0.22) !important;
  border-color: rgba(165,180,252,0.20);
  color: #ffffff !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
}

nav.app-navbar .mobile-nav-link.is-active span:last-child {
  background: rgba(255,255,255,0.14) !important;
  color: #ffffff !important;
}

/* Student experience: shared liquid-glass material. */
.student-page {
  background: transparent !important;
}

.student-page > .student-hero,
.student-hero {
  min-height: min(640px, 64svh);
}

.student-page > :not(.student-hero) > .max-w-7xl,
.student-page > .max-w-7xl {
  width: min(100% - 32px, 80rem);
  margin-left: auto;
  margin-right: auto;
}


html:not(.dark-mode) .student-glass-card,
html:not(.dark-mode) .student-glass-modal,
html:not(.dark-mode) .student-notifications section,
html:not(.dark-mode) .about-card,
html:not(.dark-mode) .exam-root .form-card,
html:not(.dark-mode) .exam-root .progress-card,
html:not(.dark-mode) .exam-root .submit-card,
html:not(.dark-mode) .exam-root .state-card {
  background: rgba(255,255,255,0.70) !important;
  border-color: rgba(255,255,255,0.78) !important;
  box-shadow: 0 24px 62px rgba(48,55,102,0.13), inset 0 1px 0 rgba(255,255,255,0.88) !important;
  backdrop-filter: blur(24px) saturate(155%);
  -webkit-backdrop-filter: blur(24px) saturate(155%);
}

html.dark-mode .student-glass-card,
html.dark-mode .student-glass-modal,
html.dark-mode .student-notifications section,
html.dark-mode .about-card,
html.dark-mode .exam-root .form-card,
html.dark-mode .exam-root .progress-card,
html.dark-mode .exam-root .submit-card,
html.dark-mode .exam-root .state-card {
  background: rgba(21,23,51,0.70) !important;
  border-color: rgba(165,180,252,0.17) !important;
  box-shadow: 0 28px 68px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.07) !important;
  backdrop-filter: blur(24px) saturate(145%);
  -webkit-backdrop-filter: blur(24px) saturate(145%);
}

.student-glass-card,
.student-glass-modal,
.about-card,
.exam-root .form-card,
.exam-root .progress-card,
.exam-root .submit-card,
.exam-root .state-card {
  border-radius: 24px !important;
}

html:not(.dark-mode) .student-page input,
html:not(.dark-mode) .student-page select,
html:not(.dark-mode) .student-page textarea {
  background: rgba(255,255,255,0.72) !important;
  border-color: rgba(148,163,184,0.26) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.88), 0 10px 28px rgba(48,55,102,0.06) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

html.dark-mode .student-page input,
html.dark-mode .student-page select,
html.dark-mode .student-page textarea {
  background: rgba(7,8,22,0.54) !important;
  border-color: rgba(165,180,252,0.20) !important;
  color: #f4f7ff !important;
}

/* Keep the expanded mobile navigation as one continuous dark glass layer. */
nav.app-navbar.menu-open {
  background: rgba(10,14,31,0.90) !important;
  border-color: rgba(165,180,252,0.16) !important;
  box-shadow: 0 24px 56px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.07) !important;
}

nav.app-navbar.menu-open .app-nav-control {
  color: #ffffff !important;
  background: rgba(255,255,255,0.07) !important;
}

@media (hover: hover) and (pointer: fine) {
  .student-glass-card {
    transition: transform 0.28s cubic-bezier(.2,.8,.2,1), box-shadow 0.28s ease, border-color 0.28s ease;
  }

  .student-glass-card:hover,
  .about-card:hover {
    transform: translateY(-5px);
    border-color: rgba(129,140,248,0.34) !important;
    box-shadow: 0 30px 76px rgba(55,48,130,0.18), inset 0 1px 0 rgba(255,255,255,0.90) !important;
  }
}

@media (max-width: 767px) {
  .student-glass-card,
  .student-glass-modal,
  .about-card,
  .exam-root .form-card,
  .exam-root .progress-card,
  .exam-root .submit-card,
  .exam-root .state-card {
    border-radius: 20px !important;
  }

  .student-hero {
    min-height: 72svh;
    height: 72svh !important;
  }

  .student-home-hero {
    min-height: 100svh;
    height: auto !important;
  }

  .student-page > :not(.student-hero) > .max-w-7xl,
  .student-page > .max-w-7xl {
    width: min(100% - 24px, 80rem);
  }
}

/* Responsive liquid-glass navbar: compact on iPhone, floating on MacBook. */
nav.app-navbar,
html:not(.dark-mode) nav.app-navbar,
html.dark-mode nav.app-navbar {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  padding-top: max(8px, env(safe-area-inset-top)) !important;
  padding-left: max(8px, env(safe-area-inset-left));
  padding-right: max(8px, env(safe-area-inset-right));
  pointer-events: none;
}

nav.app-navbar .app-navbar-shell,
nav.app-navbar .mobile-nav-sheet {
  pointer-events: auto;
}

nav.app-navbar .app-navbar-shell {
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 22px;
  background: rgba(15,23,42,0.68);
  box-shadow: 0 18px 46px rgba(15,23,42,0.20), inset 0 1px 0 rgba(255,255,255,0.12);
  backdrop-filter: blur(28px) saturate(165%);
  -webkit-backdrop-filter: blur(28px) saturate(165%);
}

html:not(.dark-mode) nav.app-navbar.app-navbar-scrolled .app-navbar-shell {
  border-color: rgba(255,255,255,0.78);
  background: rgba(248,250,255,0.76);
  box-shadow: 0 18px 46px rgba(45,55,100,0.14), inset 0 1px 0 rgba(255,255,255,0.92);
}

html.dark-mode nav.app-navbar .app-navbar-shell {
  border-color: rgba(165,180,252,0.17);
  background: rgba(10,14,31,0.76);
  box-shadow: 0 20px 52px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08);
}

nav.app-navbar.app-navbar-top [data-brand="elearning"],
html.dark-mode nav.app-navbar [data-brand="elearning"] {
  color: #ffffff !important;
}

nav.app-navbar.app-navbar-top [data-brand="elearning"] span,
html.dark-mode nav.app-navbar [data-brand="elearning"] span {
  color: #c7d2fe !important;
}

html:not(.dark-mode) nav.app-navbar.app-navbar-scrolled [data-brand="elearning"] {
  color: #172033 !important;
}

html:not(.dark-mode) nav.app-navbar.app-navbar-scrolled [data-brand="elearning"] span {
  color: #4f46e5 !important;
}

nav.app-navbar .app-nav-control,
nav.app-navbar .app-profile-control {
  border-color: rgba(255,255,255,0.14) !important;
  background: rgba(255,255,255,0.07) !important;
  color: #ffffff !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

html:not(.dark-mode) nav.app-navbar.app-navbar-scrolled .app-nav-control,
html:not(.dark-mode) nav.app-navbar.app-navbar-scrolled .app-profile-control {
  border-color: rgba(148,163,184,0.20) !important;
  background: rgba(255,255,255,0.62) !important;
  color: #334155 !important;
}

nav.app-navbar .app-nav-control:hover,
nav.app-navbar .app-nav-control:focus-visible,
nav.app-navbar .app-profile-control:hover,
nav.app-navbar .app-profile-control:focus-visible {
  background: rgba(129,140,248,0.18) !important;
  border-color: rgba(165,180,252,0.30) !important;
}

nav.app-navbar .mobile-nav-sheet {
  width: min(100%, 80rem);
  margin: 8px auto 0;
  border: 1px solid rgba(165,180,252,0.16) !important;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(10,14,31,0.84) !important;
  box-shadow: 0 24px 60px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08);
}

@media (min-width: 1024px) {
  nav.app-navbar {
    padding-left: 16px;
    padding-right: 16px;
  }

  nav.app-navbar .app-navbar-shell {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}

@media (max-width: 1023px) {
  nav.app-navbar {
    padding-left: max(6px, env(safe-area-inset-left));
    padding-right: max(6px, env(safe-area-inset-right));
  }

  nav.app-navbar .app-navbar-shell {
    border-radius: 19px;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  nav.app-navbar .mobile-nav-sheet {
    border-radius: 19px;
  }
}

@media (max-width: 430px) {
  nav.app-navbar .app-navbar-shell > div {
    gap: 6px !important;
  }

  nav.app-navbar [data-brand="elearning"] {
    font-size: 1rem !important;
  }

  nav.app-navbar .app-nav-control {
    width: 38px !important;
    height: 38px !important;
    min-width: 38px !important;
  }

  nav.app-navbar .app-profile-control {
    padding-right: 6px !important;
    gap: 4px !important;
  }
}

/* Shared authentication, subscription, and account dialog material. */
.student-liquid-modal {
  border: 1px solid rgba(255,255,255,0.76) !important;
  background: rgba(255,255,255,0.80) !important;
  box-shadow: 0 34px 90px rgba(30,38,86,0.24), inset 0 1px 0 rgba(255,255,255,0.94) !important;
  backdrop-filter: blur(30px) saturate(165%);
  -webkit-backdrop-filter: blur(30px) saturate(165%);
}

html.dark-mode .student-liquid-modal {
  border-color: rgba(165,180,252,0.18) !important;
  background: rgba(16,18,42,0.88) !important;
  color: #f4f7ff !important;
  box-shadow: 0 38px 96px rgba(0,0,0,0.54), inset 0 1px 0 rgba(255,255,255,0.08) !important;
}

html.dark-mode .student-liquid-modal h1,
html.dark-mode .student-liquid-modal h2,
html.dark-mode .student-liquid-modal h3,
html.dark-mode .student-liquid-modal label {
  color: #f4f7ff !important;
}

html.dark-mode .student-liquid-modal input,
html.dark-mode .student-liquid-modal select,
html.dark-mode .student-liquid-modal textarea {
  background: rgba(7,8,22,0.56) !important;
  border-color: rgba(165,180,252,0.20) !important;
  color: #f4f7ff !important;
}

html.dark-mode .student-liquid-modal p[class*="text-gray-"],
html.dark-mode .student-liquid-modal p[class*="text-slate-"] {
  color: #a8b1d6 !important;
}

@media (max-width: 640px) {
  .student-liquid-modal {
    max-height: calc(100dvh - max(12px, env(safe-area-inset-top))) !important;
    border-radius: 24px 24px 0 0 !important;
    margin-bottom: env(safe-area-inset-bottom);
  }
}

/* === REDUCE ANIMATIONS === */
html.reduce-animations *,
html.reduce-animations *::before,
html.reduce-animations *::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  transition-delay: 0ms !important;
  scroll-behavior: auto !important;
}

/* === HIGH CONTRAST === */
html.high-contrast {
  filter: contrast(1.5) saturate(1.3);
}

/* === COMPACT VIEW === */
html.compact-view .p-8 { padding: 14px !important; }
html.compact-view .p-7 { padding: 12px !important; }
html.compact-view .p-6 { padding: 12px !important; }
html.compact-view .p-5 { padding: 10px !important; }
html.compact-view .p-4 { padding: 8px !important; }
html.compact-view .p-3 { padding: 6px !important; }
html.compact-view .px-8 { padding-left: 14px !important; padding-right: 14px !important; }
html.compact-view .px-6 { padding-left: 12px !important; padding-right: 12px !important; }
html.compact-view .py-8 { padding-top: 14px !important; padding-bottom: 14px !important; }
html.compact-view .py-6 { padding-top: 12px !important; padding-bottom: 12px !important; }
html.compact-view .py-5 { padding-top: 10px !important; padding-bottom: 10px !important; }
html.compact-view .py-4 { padding-top: 8px !important; padding-bottom: 8px !important; }
html.compact-view .mb-10 { margin-bottom: 16px !important; }
html.compact-view .mb-8 { margin-bottom: 12px !important; }
html.compact-view .mb-6 { margin-bottom: 10px !important; }
html.compact-view .mb-4 { margin-bottom: 6px !important; }
html.compact-view .mt-8 { margin-top: 12px !important; }
html.compact-view .mt-6 { margin-top: 10px !important; }
html.compact-view .gap-8 { gap: 14px !important; }
html.compact-view .gap-6 { gap: 12px !important; }
html.compact-view .gap-4 { gap: 8px !important; }
html.compact-view .space-y-8 > * + * { margin-top: 14px !important; }
html.compact-view .space-y-6 > * + * { margin-top: 12px !important; }
html.compact-view .space-y-5 > * + * { margin-top: 10px !important; }
html.compact-view .space-y-4 > * + * { margin-top: 8px !important; }
html.compact-view .text-5xl { font-size: 2rem !important; }
html.compact-view .text-4xl { font-size: 1.6rem !important; }
html.compact-view .text-3xl { font-size: 1.4rem !important; }
html.compact-view .text-2xl { font-size: 1.15rem !important; }
html.compact-view .text-xl { font-size: 1rem !important; }
html.compact-view .text-lg { font-size: 0.9rem !important; }
`;

const GlobalStyles = () => {
  useEffect(() => {
    const id = "lf-global-styles";
    document.getElementById(id)?.remove();
    const el = document.createElement("style");
    el.id = id;
    el.textContent = CSS;
    document.head.appendChild(el);
    
    // Cleanup on unmount
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);
  
  return null;
};

export default GlobalStyles;
