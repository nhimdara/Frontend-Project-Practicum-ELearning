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
  ArrowUp,
} from "lucide-react";

import projectImage from "./../assets/image/projectbanner.jpg";

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
        setProjects(data);
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
      });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Banner */}
      <div className="relative w-full h-[600px] overflow-hidden group">
        <div className="absolute inset-0">
          <img
            src={projectImage}
            alt="Project Showcase"
            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
          />

          <div className="absolute inset-0 bg-black/60" style={{ zIndex: 1 }} />

          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 w-full">
            <div className="max-w-2xl space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Rocket className="h-4 w-4 text-cyan-300" />

                <span className="text-xs font-semibold text-white uppercase tracking-widest">
                  Portfolio Showcase
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
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
                <button className="group bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2 hover:scale-105">
                  View All Projects
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button className="border border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:scale-105">
                  GitHub Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-indigo-600" />

            <span className="text-sm font-semibold text-indigo-700">
              My Work
            </span>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
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
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden animate-fade-in-up border border-gray-100"
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
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    ⭐ Featured
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-90 z-10">
                  <a
                    href={project.github_url || project.github || "#"}
                    target={project.github_url || project.github ? "_blank" : undefined}
                    rel="noreferrer"
                    className={`bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 hover:scale-110 transition-all duration-300 border border-white/30 ${
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
                    className={`bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 hover:scale-110 transition-all duration-300 border border-white/30 ${
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
                  ).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                    >
                      <Code2 className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
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
      <button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <span className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center">
          <ArrowUp className="h-5 w-5 text-white" />
        </span>
      </button>
    </div>
  );
};

export default ProjectsPage;
