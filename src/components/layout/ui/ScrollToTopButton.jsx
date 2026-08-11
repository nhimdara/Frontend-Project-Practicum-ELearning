import React from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = ({ visible = true }) => (
  <button
    type="button"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    aria-label="Scroll to top"
    className={`app-scroll-top fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500 ${
      visible
        ? "pointer-events-auto translate-y-0 opacity-100"
        : "pointer-events-none translate-y-6 opacity-0"
    }`}
  >
    <span className="app-scroll-top-ring absolute inset-0 rounded-full" />
    <span className="app-scroll-top-core group relative z-10 flex h-12 w-12 items-center justify-center rounded-full">
      <ArrowUp className="h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5" />
    </span>
    <span className="app-scroll-top-glow absolute inset-0 rounded-full opacity-0 transition-opacity duration-300" />

    <style>{`
      @keyframes app-scroll-top-spin {
        from { transform:rotate(0deg); }
        to { transform:rotate(360deg); }
      }
      .app-scroll-top {
        border:1px solid rgba(255,255,255,.42);
        background:rgba(255,255,255,.18);
        box-shadow:0 16px 40px rgba(76,60,180,.25),inset 0 1px 0 rgba(255,255,255,.58);
        backdrop-filter:blur(18px) saturate(180%);
        -webkit-backdrop-filter:blur(18px) saturate(180%);
      }
      .app-scroll-top-ring {
        background:conic-gradient(from 0deg,var(--accent-color),var(--accent-secondary),var(--accent-color));
        animation:app-scroll-top-spin 3s linear infinite;
        opacity:.72;
      }
      .app-scroll-top-core {
        background:var(--accent-gradient);
        box-shadow:0 8px 20px rgba(79,70,229,.42),inset 0 1px 0 rgba(255,255,255,.22);
      }
      .app-scroll-top:hover .app-scroll-top-core { transform:scale(1.08); }
      .app-scroll-top-glow { background:var(--accent-gradient); filter:blur(9px); }
      .app-scroll-top:hover .app-scroll-top-glow { opacity:.34; }
      .app-scroll-top:focus-visible { outline:3px solid var(--accent-ring); outline-offset:4px; }
      html.dark-mode .app-scroll-top {
        border-color:rgba(165,180,252,.28);
        background:rgba(12,16,36,.72);
        box-shadow:0 18px 44px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.10);
      }
      @media (max-width:640px) {
        .app-scroll-top {
          right:max(16px,env(safe-area-inset-right));
          bottom:max(16px,env(safe-area-inset-bottom));
          width:52px;
          height:52px;
        }
        .app-scroll-top-core { width:44px; height:44px; }
      }
      html.reduce-animations .app-scroll-top-ring { animation:none; }
    `}</style>
  </button>
);

export default ScrollToTopButton;
