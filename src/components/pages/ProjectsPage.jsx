import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import {
  Layers,
  Github,
  ExternalLink,
  Code2,
  Rocket,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import ScrollToTopButton from "../layout/ui/ScrollToTopButton";

import projectImage from "./../assets/image/projectbanner.jpg";

const TEACHER_APPROVED_TAG = "teacher-approved";
const PROJECT_MAJOR_PREFIX = "major:";

const ProjectsPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ✅ projects state from database
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    // ✅ fetch projects from backend API
    fetch(`${API_BASE_URL}/projects`)
      .then((res) => res.json())
      .then((data) => {
        const visibleProjects = Array.isArray(data)
          ? data.filter(
              (project) =>
                project.is_active !== false &&
                project.is_active !== 0 &&
                project.is_active !== "0",
            )
          : [];
        setProjects(visibleProjects);
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
      });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="student-page student-projects min-h-screen bg-[#f4f5fb]">
      <style>{`
        .student-projects {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
        }
        @keyframes fade-in-up { from { opacity:0; transform:translateY(20px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes scroll-dot { 0% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(10px); } }
        .animate-scroll { animation: scroll-dot 1.5s ease-in-out infinite; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

        /* ── Liquid glass primitives ───────────────────────── */
        .lg-pill {
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.28);
          border-radius: 999px;
        }
        .lg-icon-btn {
          background: rgba(255,255,255,0.16);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        }
        .lg-icon-btn:hover { background: rgba(255,255,255,0.28); }

        .lg-primary-button {
          background: var(--accent-gradient);
          border-radius: 999px;
          color: #fff;
          font-weight: 600;
          box-shadow: 0 10px 26px var(--accent-glow), 0 1px 0 rgba(255,255,255,0.25) inset;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .lg-primary-button:hover {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 14px 32px rgba(99,102,241,0.5), 0 1px 0 rgba(255,255,255,0.25) inset;
        }
        .lg-ghost-button {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(14px) saturate(180%);
          -webkit-backdrop-filter: blur(14px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 999px;
          color: #fff;
          font-weight: 600;
          transition: all 0.25s ease;
        }
        .lg-ghost-button:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.03);
        }

        .lg-badge {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 999px;
        }

        .lg-eyebrow {
          background: rgba(99,102,241,0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 999px;
        }

        .lg-project-card {
          background: rgba(255,255,255,0.62);
          backdrop-filter: blur(22px) saturate(180%);
          -webkit-backdrop-filter: blur(22px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 26px;
          box-shadow: 0 1px 1px rgba(255,255,255,0.85) inset, 0 8px 30px rgba(31,41,55,0.08);
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease;
        }
        .lg-project-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 1px 1px rgba(255,255,255,0.85) inset, 0 22px 48px rgba(31,41,55,0.16);
        }

        .lg-featured-badge {
          background: rgba(245,158,11,0.85);
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 999px;
          box-shadow: 0 6px 16px rgba(245,158,11,0.4);
        }

        .lg-tag {
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 999px;
          transition: all 0.2s ease;
        }
        .lg-tag:hover {
          background: rgba(99,102,241,0.14);
          color: #4338ca;
        }

      `}</style>

      {/* Hero Banner */}
      <div className="student-hero relative w-full h-[600px] overflow-hidden group">
        <div className="absolute inset-0">
          <img
            src={projectImage}
            alt="Project Showcase"
            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,25,0.35) 0%, rgba(10,10,25,0.7) 100%)",
              zIndex: 1,
            }}
          />

          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full">
            <div className="max-w-2xl space-y-6 animate-fade-in-up">
              <div className="lg-pill inline-flex items-center gap-2 px-4 py-2">
                <Rocket className="h-4 w-4 text-cyan-300" />

                <span className="text-xs font-semibold text-white uppercase tracking-widest">
                  Portfolio Showcase
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
                Creating Digital
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
                  Masterpieces
                </span>
              </h1>

              <p className="text-lg text-gray-200 leading-relaxed max-w-xl">
                Explore my portfolio of innovative web applications, from
                AI-powered dashboards to blockchain solutions.
              </p>

              <div className="flex gap-4 pt-4">
                <button className="lg-primary-button group px-8 py-3 flex items-center gap-2">
                  View All Projects
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="lg-ghost-button px-8 py-3">
                  GitHub Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="lg-pill w-6 h-10 flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="lg-eyebrow inline-flex items-center gap-2 px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-indigo-600" />

            <span className="text-sm font-semibold text-indigo-700">
              My Work
            </span>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Featured Projects
          </h2>

          <p className="text-lg text-gray-600">
            A collection of projects that showcase my expertise in modern web
            development.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="student-glass-card lg-project-card group relative overflow-hidden animate-fade-in-up"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image || project.image_url || projectImage}
                  alt={project.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Featured Badge */}
                {project.featured && (
                  <div className="lg-featured-badge absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 z-10">
                    ⭐ Featured
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-90 z-10">
                  <a
                    href={project.github_url || project.github || "#"}
                    target={project.github_url || project.github ? "_blank" : undefined}
                    rel="noreferrer"
                    className={`lg-icon-btn text-white p-3 rounded-full hover:scale-110 transition-all duration-300 ${
                      project.github_url || project.github
                        ? ""
                        : "pointer-events-none opacity-50"
                    }`}
                  >
                    <Github className="h-5 w-5" />
                  </a>

                  <a
                    href={project.live_url || project.demo_url || "#"}
                    target={project.live_url || project.demo_url ? "_blank" : undefined}
                    rel="noreferrer"
                    className={`lg-icon-btn text-white p-3 rounded-full hover:scale-110 transition-all duration-300 ${
                      project.live_url || project.demo_url
                        ? ""
                        : "pointer-events-none opacity-50"
                    }`}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-600" />

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Array.isArray(project.tags)
                    ? project.tags
                    : String(project.tags || "")
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                  )
                    .filter(
                      (tag) =>
                        tag !== TEACHER_APPROVED_TAG &&
                        !tag.startsWith(PROJECT_MAJOR_PREFIX),
                    )
                    .map((tag) => (
                    <span
                      key={tag}
                      className="lg-tag inline-flex items-center gap-1 text-gray-700 text-xs px-3 py-1"
                    >
                      <Code2 className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-900/[0.06]">
                  <a
                    href={project.github_url || project.github || "#"}
                    target={project.github_url || project.github ? "_blank" : undefined}
                    rel="noreferrer"
                    className={`flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors group ${
                      project.github_url || project.github
                        ? ""
                        : "pointer-events-none opacity-50"
                    }`}
                  >
                    <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Code
                  </a>

                  <a
                    href={project.live_url || project.demo_url || "#"}
                    target={project.live_url || project.demo_url ? "_blank" : undefined}
                    rel="noreferrer"
                    className={`flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors group ${
                      project.live_url || project.demo_url
                        ? ""
                        : "pointer-events-none opacity-50"
                    }`}
                  >
                    <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Live Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll To Top */}
      <ScrollToTopButton visible={showScrollTop} />
    </div>
  );
};

export default ProjectsPage;
