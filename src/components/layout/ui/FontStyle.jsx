import React from "react";

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    .nav-font  { font-family: 'Outfit', sans-serif; }
    .body-font { font-family: 'DM Sans', sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.4; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    .anim-1 { animation: fadeUp 0.7s ease-out 0.1s both; }
    .anim-2 { animation: fadeUp 0.7s ease-out 0.25s both; }
    .anim-3 { animation: fadeUp 0.7s ease-out 0.4s both; }
    .anim-4 { animation: fadeUp 0.7s ease-out 0.55s both; }
    .anim-5 { animation: fadeUp 0.7s ease-out 0.7s both; }

    .float-badge { animation: float 4s ease-in-out infinite; }
    .float-badge-2 { animation: float 4s ease-in-out 1.5s infinite; }

    .shimmer-badge {
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1);
      background-size: 200% auto;
      animation: shimmer 3s linear infinite;
    }

    .learn-btn-pulse::before {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 20px;
      background: rgba(255,255,255,0.3);
      animation: pulse-ring 2s ease-out infinite;
    }

    .dropdown-animate { animation: fadeIn 0.18s ease-out forwards; }

    .stat-card {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    @media (max-width: 640px) {
      .hero-bg { object-position: 60% center; }
    }

    .glass-card {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.15);
    }

    .custom-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    }
  `}</style>
);

export default FontStyle;