// pages/HomePage.jsx
import React, { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import banner from "./../assets/image/banner.jpg";

/* ── Dark mode hook ── */
const useDarkMode = () => {
  const [dark, setDark] = React.useState(() =>
    document.documentElement.classList.contains("dark-mode")
  );
  
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark-mode");
      setDark(isDark);
    });
    
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, []);
  
  return dark;
};

import {
  BookOpen,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Trophy,
  Play,
  GraduationCap,
  ArrowUp,
} from "lucide-react";

/* ─────────────────────────── Particle Canvas ─────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const COUNT = 120;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.012;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

        // Draw star glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grd.addColorStop(0, `rgba(180,200,255,${a})`);
        grd.addColorStop(1, `rgba(100,140,255,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,230,255,${a})`;
        ctx.fill();
      });

      // Draw connecting lines for nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(140,170,255,${0.08 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
    />
  );
};

/* ─────────────────────────── Cursor Spotlight ─────────────────────────── */
const CursorSpotlight = ({ containerRef }) => {
  const spotRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const move = (e) => {
      if (!spotRef.current) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      spotRef.current.style.opacity = "1";
    };
    const leave = () => {
      if (spotRef.current) spotRef.current.style.opacity = "0";
    };

    container.addEventListener("mousemove", move);
    container.addEventListener("mouseleave", leave);
    return () => {
      container.removeEventListener("mousemove", move);
      container.removeEventListener("mouseleave", leave);
    };
  }, [containerRef]);

  return (
    <div
      ref={spotRef}
      className="pointer-events-none absolute z-[3] opacity-0 transition-opacity duration-300"
      style={{
        top: 0,
        left: 0,
        width: 500,
        height: 500,
        marginLeft: -250,
        marginTop: -250,
        background:
          "radial-gradient(circle, rgba(99,120,255,0.15) 0%, rgba(99,120,255,0.06) 40%, transparent 70%)",
        borderRadius: "50%",
        transition: "opacity 0.3s ease",
      }}
    />
  );
};

/* ─────────────────────────── useScrollReveal hook ─────────────────────── */
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || 0;
            setTimeout(() => {
              el.classList.add("revealed");
            }, Number(delay));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

/* ─────────────────────────── Main Component ─────────────────────────── */
const HomePage = () => {
  const dark = useDarkMode();
  const heroRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Parallax on hero bg image */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const bg = el.querySelector(".hero-bg");
    if (!bg) return;

    const onScroll = () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight * 1.5) {
        bg.style.transform = `translateY(${scrolled * 0.28}px) scale(1.08)`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stats = [
    { icon: Users, value: "5k+", label: "Students" },
    { icon: BookOpen, value: "200+", label: "Courses" },
    { icon: Trophy, value: "98%", label: "Success Rate" },
  ];

  const features = [
    "Expert-led video courses",
    "Live mentorship sessions",
    "Industry certificates",
    "Lifetime course access",
  ];

  const aboutCards = [
    {
      icon: BookOpen,
      color: "from-indigo-500 to-violet-600",
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      title: "200+ Expert Courses",
      desc: "From coding and design to business and creativity — our curriculum is crafted by industry professionals and updated regularly.",
    },
    {
      icon: Users,
      color: "from-cyan-500 to-indigo-600",
      bg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      title: "Live Mentorship",
      desc: "Get real-time guidance from mentors who've been where you want to go. Weekly office hours, 1-on-1 sessions, and group workshops.",
    },
    {
      icon: Trophy,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      title: "Recognised Certificates",
      desc: "Earn certificates that employers trust. Our credentials are backed by top universities and Fortune 500 partners.",
    },
    {
      icon: Zap,
      color: "from-violet-500 to-pink-600",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      title: "Learn at Your Pace",
      desc: "Lifetime access to every course you enrol in. Pause, replay, and revisit lessons whenever and wherever you want.",
    },
    {
      icon: CheckCircle,
      color: "from-rose-500 to-red-600",
      bg: "bg-rose-50",
      iconColor: "text-rose-600",
      title: "98% Success Rate",
      desc: "Our structured learning paths and accountability tools ensure you finish what you start and actually apply what you learn.",
    },
  ];

  return (
    <>
      {/* ── Scroll-reveal + animation styles ── */}
      <style>{`
        /* ── Scroll reveal ── */
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(.22,.68,0,1.2),
                      transform 0.65s cubic-bezier(.22,.68,0,1.2);
        }
        [data-reveal="left"] { transform: translateX(-32px); }
        [data-reveal="right"] { transform: translateX(32px); }
        [data-reveal="scale"] { transform: scale(0.88); }
        [data-reveal].revealed {
          opacity: 1 !important;
          transform: none !important;
        }

        /* ── Hero animations ── */
        .anim-1 { animation: fadeSlideUp 0.7s 0.1s both; }
        .anim-2 { animation: fadeSlideUp 0.7s 0.25s both; }
        .anim-3 { animation: fadeSlideUp 0.7s 0.4s both; }
        .anim-4 { animation: fadeSlideUp 0.7s 0.55s both; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: none; }
        }

        /* ── Floating stat cards ── */
        .float-badge   { animation: float1 4.5s ease-in-out infinite; }
        .float-badge-2 { animation: float2 5.2s ease-in-out infinite 0.8s; }
        @keyframes float1 {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-7px); }
        }
        @keyframes float2 {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-10px); }
        }

        /* ── Pulse button ── */
        .learn-btn-pulse::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: inherit;
          animation: btnPulse 2.4s ease-out infinite;
          z-index: -1;
        }
        @keyframes btnPulse {
          0%   { opacity: 0.55; transform: scale(1); }
          100% { opacity: 0;    transform: scale(1.28); }
        }

        /* ── Stat card hover shimmer ── */
        .stat-card {
          position: relative;
          overflow: hidden;
          cursor: default;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.55s ease;
        }
        .stat-card:hover::after { transform: translateX(100%); }
        .stat-card:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 16px 40px rgba(99,120,255,0.3);
        }

        /* ── About card shine ── */
        .about-card {
          position: relative;
          overflow: hidden;
        }
        .about-card::before {
          content: '';
          position: absolute;
          top: -60%;
          left: -60%;
          width: 60%;
          height: 220%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.18),
            transparent
          );
          transform: skewX(-20deg) translateX(-100%);
          transition: none;
          pointer-events: none;
        }
        .about-card:hover::before {
          transform: skewX(-20deg) translateX(380%);
          transition: transform 0.65s ease;
        }

        /* ── Hero bg parallax base ── */
        .hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform-origin: center top;
          will-change: transform;
        }

        /* ── Glass card ── */
        .glass-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
        }

        /* ── CTA banner aurora ── */
        .cta-aurora {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .cta-aurora::before,
        .cta-aurora::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          animation: auroraMove 8s ease-in-out infinite alternate;
        }
        .cta-aurora::before {
          width: 340px; height: 340px;
          background: rgba(99,200,255,0.15);
          top: -80px; right: 10%;
        }
        .cta-aurora::after {
          width: 280px; height: 280px;
          background: rgba(200,120,255,0.12);
          bottom: -60px; left: 15%;
          animation-delay: 2s;
        }
        @keyframes auroraMove {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.15); }
        }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>

      {/* ══════════════ HERO SECTION ══════════════ */}
      <section
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col overflow-hidden"
      >
        <img
          src={banner}
          alt="EduLearn campus"
          className="hero-bg"
          loading="eager"
        />

        {/* Particle field */}
        <ParticleCanvas />

        {/* Cursor spotlight */}
        <CursorSpotlight containerRef={heroRef} />

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-indigo-900/30 via-transparent to-cyan-900/20" />

        {/* HERO CONTENT */}
        <div className="relative z-10 flex flex-col justify-center flex-1 pt-[66px]">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-28">
            <div className="max-w-xl lg:max-w-2xl">
              <div className="anim-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card mb-6 sm:mb-8">
                <Zap className="h-3.5 w-3.5 text-cyan-300" />
                <span className="text-[0.72rem] font-semibold text-white/90 tracking-wide uppercase">
                  #1 Online Learning Platform
                </span>
              </div>

              <h1 className="anim-2 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-[-0.03em] mb-4 sm:mb-6">
                Learn Without
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300">
                  Limits
                </span>
              </h1>

              <p className="anim-3 text-base sm:text-lg text-white/75 leading-relaxed mb-6 sm:mb-8 max-w-lg">
                Join over{" "}
                <strong className="text-white font-semibold">
                  50,000+ students
                </strong>{" "}
                worldwide unlocking their potential with expert-led courses,
                live mentorship, and industry-recognised certificates.
              </p>

              <ul className="anim-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-8 sm:mb-10">
                {features.map((f, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle
                      className="h-4 w-4 text-cyan-400 flex-shrink-0"
                      strokeWidth={2.5}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="anim-4 flex flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/lessons"
                  className="learn-btn-pulse relative flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white text-[0.9rem] sm:text-base font-bold shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-white" />
                  Start Learning Now
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>

                <Link
                  to="/lessons"
                  className="flex items-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white text-[0.9rem] sm:text-base font-semibold ring-1 ring-white/25 hover:bg-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="relative z-10 w-full pb-8 sm:pb-10">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {stats.map(({ icon: Icon, value, label }, i) => (
                  <div
                    key={label}
                    className={`stat-card rounded-2xl px-4 sm:px-5 py-4 text-center ${
                      i % 2 === 0 ? "float-badge" : "float-badge-2"
                    }`}
                    style={{
                      background: "rgba(0,0,0,0.30)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/30 mb-2">
                      <Icon className="h-4 w-4 text-indigo-300" />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      {value}
                    </p>
                    <p className="text-[0.7rem] text-white/55 font-medium">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ ABOUT SECTION ══════════════ */}
      <section id="about" className="py-20 sm:py-28" style={{ background: dark ? "#0a0a14" : "white" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          {/* Section header */}
          <div className="text-center mb-12 sm:mb-16">
            <span
              data-reveal
              data-delay="0"
              className="inline-block text-[0.72rem] font-bold uppercase tracking-[0.15em] text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4"
            >
              About EduLearn
            </span>
            <h2
              data-reveal
              data-delay="80"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4" 
              style={{ color: dark ? "#f0f0fa" : "#111827" }}
            >
              Built for the
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                {" "}future of learning
              </span>
            </h2>
            <p
              data-reveal
              data-delay="160"
              className="max-w-2xl mx-auto text-gray-500 text-base sm:text-lg leading-relaxed"
            >
              EduLearn is a next-generation online education platform that
              combines expert instruction, community, and technology to help you
              grow your career and knowledge — on your schedule.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {aboutCards.map(({ icon: Icon, color, bg, iconColor, title, desc }, idx) => (
              <div
                key={title}
                data-reveal
                data-delay={idx * 90}
                className="about-card group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`absolute top-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} mb-4`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2} />
                </div>
                <h3 className="text-[1rem] font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div
            data-reveal="scale"
            data-delay="100"
            className="mt-16 sm:mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 sm:px-10 py-12 sm:py-14 text-center"
          >
            {/* Aurora effect */}
            <div className="cta-aurora" />

            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative z-10">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.15em] text-indigo-200 mb-3">
                Ready to start?
              </p>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Your future starts today.
              </h3>
              <p className="text-white/65 mb-8 max-w-md mx-auto text-sm sm:text-base">
                Join thousands of learners who transformed their careers with
                EduLearn. First course is completely free.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button                 
                  onClick={() => window.location.href = "/lessons"}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm sm:text-base shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
                >
                  <Play className="h-4 w-4 fill-indigo-600" />
                  Start Learning Now
                </button>
                <Link
                  to="/lessons"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/10 ring-1 ring-white/20 text-white font-semibold text-sm sm:text-base hover:bg-white/20 transition-all"
                >
                  <BookOpen className="h-4 w-4" />
                  Browse Free Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scroll To Top Button ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${showScrollTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"}`}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 animate-spin-slow opacity-80" />
        <span className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex items-center justify-center hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-110 group shadow-lg shadow-indigo-500/40">
          <ArrowUp className="h-5 w-5 text-white group-hover:-translate-y-0.5 transition-transform duration-300" />
        </span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 opacity-0 hover:opacity-30 blur-md transition-opacity duration-300" />
      </button>
    </>
  );
};

export default HomePage;