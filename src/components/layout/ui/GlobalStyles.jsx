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
html { font-size: var(--app-font-size, 15px) !important; }
body, button, input, select, textarea {
  font-family: var(--app-font-family, 'DM Sans', sans-serif) !important;
}

/* === DARK MODE === */
html.dark-mode {
  color-scheme: dark;
  background-color: #0a0a14;
}

html.dark-mode body {
  background-color: #0a0a14 !important;
  color: #e8e8f5 !important;
}

html.dark-mode .min-h-screen {
  background: #0a0a14 !important;
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
  background-color: #131324 !important;
}

html.dark-mode .bg-gray-50 {
  background-color: #1a1a30 !important;
}

html.dark-mode .bg-gray-100 {
  background-color: #22223a !important;
}

html.dark-mode .bg-gray-200 {
  background-color: #2a2a4a !important;
}

html.dark-mode .bg-slate-50 {
  background-color: #14142b !important;
}

/* Border colors */
html.dark-mode .border,
html.dark-mode .border-gray-50,
html.dark-mode .border-gray-100,
html.dark-mode .border-gray-200,
html.dark-mode .border-gray-300 {
  border-color: #2a2a4a !important;
}

html.dark-mode .border-b { border-bottom-color: #2a2a4a !important; }
html.dark-mode .border-t { border-top-color: #2a2a4a !important; }

html.dark-mode .divide-y > * + * { border-top-color: #2a2a4a !important; }

/* Text colors - elegant dark mode palette */
html.dark-mode .text-gray-900 { color: #f0f0fa !important; }
html.dark-mode .text-gray-800 { color: #e0e0f0 !important; }
html.dark-mode .text-gray-700 { color: #d0d0e8 !important; }
html.dark-mode .text-gray-600 { color: #b0b0d0 !important; }
html.dark-mode .text-gray-500 { color: #9090b8 !important; }
html.dark-mode .text-gray-400 { color: #8080b0 !important; }

/* Primary colors - keep vibrant */
html.dark-mode .text-indigo-600,
html.dark-mode .text-indigo-700 { color: #a5b4fc !important; }

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
html.dark-mode .glass-card,
html.dark-mode [class*="backdrop-blur"] {
  background: rgba(20, 20, 40, 0.7) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(165, 180, 252, 0.15);
}

/* Form inputs */
html.dark-mode input:not([type=checkbox]):not([type=radio]),
html.dark-mode select,
html.dark-mode textarea {
  background-color: #1a1a35 !important;
  border-color: #3a3a5c !important;
  color: #f0f0fa !important;
}

html.dark-mode input::placeholder,
html.dark-mode textarea::placeholder {
  color: #606090 !important;
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
  background-color: rgba(10, 10, 20, 0.96) !important;
  border-bottom-color: #2a2a4a !important;
}

html.dark-mode footer {
  background-color: #13132a !important;
  border-top-color: #2a2a4a !important;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
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

/* Fix for white backgrounds with opacity */
html.dark-mode .bg-white\\/10 {
  background-color: rgba(26, 26, 53, 0.3) !important;
}

html.dark-mode .bg-white\\/20 {
  background-color: rgba(26, 26, 53, 0.5) !important;
}

html.dark-mode .bg-white\\/30 {
  background-color: rgba(26, 26, 53, 0.7) !important;
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