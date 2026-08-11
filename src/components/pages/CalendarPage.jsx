// pages/CalendarPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../config/api";
import {
  Search,
  ChevronDown,
  GraduationCap,
  Award,
  Loader2,
} from "lucide-react";
import lessonBanner from "./../assets/image/lessonpage.jpeg";
import { APP_CONFIG } from "../../config/appConfig";

// ─── API ─────────────────────────────────────────────────────
const API_BASE = API_BASE_URL;

async function fetchLessonsByMajor(major) {
  const res = await fetch(
    `${API_BASE}/lessons/by-major/${encodeURIComponent(major)}`,
  );
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}
// ─────────────────────────────────────────────────────────────

const YEAR_TABS = ["Foundation", "Second Year", "Third Year", "Fourth Year"];

// Map years to semester IDs
const YEAR_SEMESTER_MAP = {
  Foundation: { s1: "Year 1 Semester 1", s2: "Year 1 Semester 2" },
  "Second Year": { s1: "Year 2 Semester 1", s2: "Year 2 Semester 2" },
  "Third Year": { s1: "Year 3 Semester 1", s2: "Year 3 Semester 2" },
  "Fourth Year": { s1: "Year 4 Semester 1", s2: "Year 4 Semester 2" },
};

// Major options
const MAJOR_OPTIONS = APP_CONFIG.majors.map((major) => ({
  value: major.id,
  label: major.name,
  icon: major.icon,
}));

// ─── Liquid Glass CSS ───────────────────────────────────────
// Injected once per page. Defines the shimmer/float keyframes the
// glass panels reference via Tailwind arbitrary `animate-[...]`
// utilities, so no tailwind.config changes are required.
const LIQUID_GLASS_STYLES = `
  .student-calendar {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
  }
  @keyframes liquidShine {
    0%   { transform: translateX(-160%) rotate(14deg); opacity: 0; }
    12%  { opacity: .9; }
    45%  { opacity: .35; }
    60%  { transform: translateX(240%) rotate(14deg); opacity: 0; }
    100% { transform: translateX(240%) rotate(14deg); opacity: 0; }
  }
  @keyframes liquidFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(-8px, 10px) scale(1.06); }
  }
  @keyframes liquidBob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-4px); }
  }
  .liquid-row:hover .liquid-row-icon {
    transform: scale(1.08);
    background: rgba(255,255,255,0.65);
  }
  .student-calendar .calendar-accent-gradient {
    background-image: var(--accent-gradient) !important;
  }
  .student-calendar .calendar-accent-text {
    color: var(--accent-color) !important;
  }
  .student-calendar .calendar-accent-tag {
    color: var(--accent-color) !important;
    background: var(--accent-light) !important;
  }
  .student-calendar .calendar-accent-glow,
  .student-calendar .calendar-accent-blob {
    background: var(--accent-color) !important;
  }
  .student-calendar .calendar-accent-glow { opacity: .24; }
  .student-calendar .calendar-accent-blob { opacity: .18; }
  .student-calendar .calendar-accent-ring {
    --tw-ring-color: var(--accent-border) !important;
  }
`;

const YEAR_STYLE = {
  Foundation: {
    grad: "from-indigo-500/90 to-violet-600/90",
    accent: "text-indigo-600",
    tag: "bg-indigo-100/70 text-indigo-700",
    glow: "bg-indigo-400/30",
    blob: "bg-indigo-400/25",
    ring: "ring-indigo-300/40",
  },
  "Second Year": {
    grad: "from-cyan-500/90 to-indigo-600/90",
    accent: "text-cyan-600",
    tag: "bg-cyan-100/70 text-cyan-700",
    glow: "bg-cyan-400/30",
    blob: "bg-cyan-400/25",
    ring: "ring-cyan-300/40",
  },
  "Third Year": {
    grad: "from-emerald-500/90 to-teal-600/90",
    accent: "text-emerald-600",
    tag: "bg-emerald-100/70 text-emerald-700",
    glow: "bg-emerald-400/30",
    blob: "bg-emerald-400/25",
    ring: "ring-emerald-300/40",
  },
  "Fourth Year": {
    grad: "from-amber-500/90 to-orange-600/90",
    accent: "text-amber-600",
    tag: "bg-amber-100/70 text-amber-700",
    glow: "bg-amber-400/30",
    blob: "bg-amber-400/25",
    ring: "ring-amber-300/40",
  },
};

const getMajorStyle = (major, yearKey) => {
  const majorColors = {
    ITE: {
      grad: "from-indigo-500/90 to-violet-600/90",
      accent: "text-indigo-600",
      tag: "bg-indigo-100/70 text-indigo-700",
      glow: "bg-indigo-400/30",
      blob: "bg-indigo-400/25",
      ring: "ring-indigo-300/40",
    },
    IT: {
      grad: "from-cyan-500/90 to-blue-600/90",
      accent: "text-cyan-600",
      tag: "bg-cyan-100/70 text-cyan-700",
      glow: "bg-cyan-400/30",
      blob: "bg-cyan-400/25",
      ring: "ring-cyan-300/40",
    },
    Mathematics: {
      grad: "from-emerald-500/90 to-teal-600/90",
      accent: "text-emerald-600",
      tag: "bg-emerald-100/70 text-emerald-700",
      glow: "bg-emerald-400/30",
      blob: "bg-emerald-400/25",
      ring: "ring-emerald-300/40",
    },
  };
  const fallback = majorColors[major] || YEAR_STYLE[yearKey];
  return {
    ...fallback,
    grad: "calendar-accent-gradient",
    accent: "calendar-accent-text",
    tag: "calendar-accent-tag",
    glow: "calendar-accent-glow",
    blob: "calendar-accent-blob",
    ring: "calendar-accent-ring",
  };
};

// ─── Liquid Glass surface ───────────────────────────────────────
// True "macOS 26" style frosted panel: a translucent, saturated
// blur fill, a bright hairline rim that catches the light, an
// ambient corner glow tinted to the active year/major color, and a
// slow diagonal sheen that drifts across the panel — the bit of
// motion that reads as "liquid" rather than flat frosted glass.
const GlassSurface = ({
  className = "",
  glow = "bg-indigo-400/20",
  children,
}) => (
  <div
    className={`relative overflow-hidden bg-white/35 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),inset_0_-1px_2px_0_rgba(17,24,39,0.05),0_20px_45px_-15px_rgba(30,27,75,0.28)] transition-all duration-500 ${className}`}
  >
    {/* bright top rim — light catching the glass edge */}
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />
    {/* ambient corner glow, tinted to the active year/major color */}
    <div
      className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full ${glow} blur-3xl animate-[liquidFloat_9s_ease-in-out_infinite]`}
    />
    {/* drifting specular sheen — the "liquid" light sweep */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-y-12 -left-1/3 w-1/4 rotate-[14deg] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[liquidShine_8s_ease-in-out_infinite]" />
    </div>
    <div className="relative">{children}</div>
  </div>
);

const SubjectRow = ({ subj, style, onClick }) => (
  <tr
    className="liquid-row border-b border-white/40 hover:bg-white/35 hover:backdrop-blur-md transition-all duration-200 cursor-pointer group"
    onClick={() => onClick(subj)}
  >
    <td className="py-3.5 px-4 text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="liquid-row-icon flex items-center justify-center h-7 w-7 rounded-full bg-white/45 backdrop-blur-sm border border-white/60 shadow-sm transition-all duration-300 text-base leading-none">
          📘
        </span>
        <span className="font-medium">{subj.title}</span>
      </div>
    </td>
    <td className="py-3.5 px-4 text-center">
      <span className={`text-sm font-bold ${style.accent}`}>{subj.credit}</span>
    </td>
    <td className="py-3.5 px-4 text-center text-gray-500 text-sm font-mono">
      {subj.hours || "—"}
    </td>
  </tr>
);

const SemesterCard = ({ semLabel, subjects, style, onSubjectClick }) => {
  const hasOptions = subjects.some((s) => s.option);
  const opt1 = hasOptions
    ? subjects.filter((s) => s.option === "Option 1")
    : [];
  const opt2 = hasOptions
    ? subjects.filter((s) => s.option === "Option 2")
    : [];
  const regular = hasOptions ? subjects.filter((s) => !s.option) : subjects;
  const totalCredits = subjects.reduce(
    (a, s) => a + (parseFloat(s.credit) || 0),
    0,
  );

  if (subjects.length === 0) {
    return (
      <GlassSurface
        glow={style.glow}
        className={`student-glass-card flex-1 min-w-0 rounded-[28px] ring-1 ${style.ring}`}
      >
        <div
          className={`relative overflow-hidden bg-gradient-to-r ${style.grad} backdrop-blur-md px-5 py-4`}
        >
          <h3 className="text-white text-lg font-extrabold">{semLabel}</h3>
        </div>
        <div className="p-8 text-center text-gray-400">No subjects found</div>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface
      glow={style.glow}
      className={`student-glass-card flex-1 min-w-0 rounded-[28px] ring-1 ${style.ring} hover:-translate-y-1 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_28px_60px_-18px_rgba(30,27,75,0.35)]`}
    >
      <div
        className={`relative overflow-hidden bg-gradient-to-r ${style.grad} backdrop-blur-md px-5 py-4 flex items-center justify-between`}
      >
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/50" />
        {/* diagonal glass sheen across the color header, same drift as the panel */}
        <div className="pointer-events-none absolute -inset-y-10 -left-1/4 w-1/3 rotate-[14deg] bg-gradient-to-r from-transparent via-white/40 to-transparent mix-blend-overlay animate-[liquidShine_8s_ease-in-out_infinite]" />
        <div className="relative">
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            Programme
          </p>
          <h3 className="text-white text-lg font-extrabold tracking-tight italic">
            {semLabel}
          </h3>
        </div>
        <div className="relative flex flex-col items-end gap-1">
          <span className="text-white/80 text-xs">
            {subjects.length} subjects
          </span>
          <span className="text-white font-bold text-sm">
            {totalCredits.toFixed(1)} cr total
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/50 bg-white/25 backdrop-blur-md">
              <th className="py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Subject
              </th>
              <th className="py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                Credit
              </th>
              <th className="py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                Hours (L-P-S)
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {regular.map((s) => (
              <SubjectRow
                key={s.id}
                subj={s}
                style={style}
                onClick={onSubjectClick}
              />
            ))}
            {opt1.length > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="pt-4 pb-1 px-4 bg-transparent">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-700 bg-yellow-100/70 backdrop-blur-sm border border-yellow-300/50 px-3 py-1 rounded-full">
                      ✦ Option 1
                    </span>
                  </td>
                </tr>
                {opt1.map((s) => (
                  <SubjectRow
                    key={s.id}
                    subj={s}
                    style={style}
                    onClick={onSubjectClick}
                  />
                ))}
              </>
            )}
            {opt2.length > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="pt-4 pb-1 px-4 bg-transparent">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700 bg-orange-100/70 backdrop-blur-sm border border-orange-300/50 px-3 py-1 rounded-full">
                      ✦ Option 2 — GPA &gt; 3.5
                    </span>
                  </td>
                </tr>
                {opt2.map((s) => (
                  <SubjectRow
                    key={s.id}
                    subj={s}
                    style={style}
                    onClick={onSubjectClick}
                  />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </GlassSurface>
  );
};

const CalendarPage = ({ user }) => {
  const selectedMajor = user?.major?.trim() || "";
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeYear, setActiveYear] = useState("Foundation");
  const [searchTerm, setSearchTerm] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const motionFrameRef = useRef(null);

  // Fetch lessons when major changes
  useEffect(() => {
    if (!selectedMajor) return;

    fetchLessonsByMajor(selectedMajor)
      .then((data) => {
        setLessons(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [selectedMajor]);

  // Scroll and mouse effects
  useEffect(() => {
    const onScroll = () => {
      if (motionFrameRef.current) return;
      motionFrameRef.current = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
        motionFrameRef.current = null;
      });
    };
    const allowPointerMotion = window.matchMedia(
      "(hover: hover) and (prefers-reduced-motion: no-preference)",
    ).matches;
    const onMouse = (event) => {
      if (motionFrameRef.current) return;
      motionFrameRef.current = requestAnimationFrame(() => {
        setMousePos({
          x: (event.clientX / window.innerWidth - 0.5) * 18,
          y: (event.clientY / window.innerHeight - 0.5) * 18,
        });
        motionFrameRef.current = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (allowPointerMotion) window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (allowPointerMotion) window.removeEventListener("mousemove", onMouse);
      if (motionFrameRef.current) cancelAnimationFrame(motionFrameRef.current);
    };
  }, []);

  const filterSubjects = (semesterName) => {
    return lessons.filter((l) => {
      const matchesSemester = l.semester === semesterName;
      const matchesSearch =
        searchTerm === "" ||
        l.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSemester && matchesSearch;
    });
  };

  const semesters = YEAR_SEMESTER_MAP[activeYear];
  const sem1Subjects = filterSubjects(semesters.s1);
  const sem2Subjects = filterSubjects(semesters.s2);
  const style = getMajorStyle(selectedMajor, activeYear);

  const getMajorDisplayName = () => {
    const major = MAJOR_OPTIONS.find((m) => m.value === selectedMajor);
    return major ? major.label : selectedMajor;
  };

  if (!selectedMajor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-[#f4f5fb]">
        <div className="p-5 rounded-full bg-white/60 backdrop-blur-xl border border-white/70 shadow-lg">
          <GraduationCap className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Major not assigned</h2>
        <p className="text-gray-500 text-sm text-center">
          Your account does not have a major assigned. Please contact an
          administrator.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f4f5fb]">
        <div className="p-5 rounded-full bg-white/60 backdrop-blur-xl border border-white/70 shadow-lg">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
        <p className="text-gray-500 font-medium">Loading curriculum...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-[#f4f5fb]">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800">
          Failed to load curriculum
        </h2>
        <p className="text-red-600 text-sm bg-red-50/80 backdrop-blur-sm border border-red-200/60 px-4 py-2 rounded-xl">
          {error}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchLessonsByMajor(selectedMajor)
              .then(setLessons)
              .catch((e) => setError(e.message))
              .finally(() => setLoading(false));
          }}
          className="mt-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:brightness-110 shadow-lg shadow-indigo-500/30 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="student-page student-calendar min-h-screen bg-[#f4f5fb] relative overflow-hidden">
      <style>{LIQUID_GLASS_STYLES}</style>

      {/* Ambient liquid background — the color/light the glass panels refract */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-[620px] -right-32 w-96 h-96 rounded-full blur-3xl opacity-60 ${style.blob} animate-[liquidFloat_11s_ease-in-out_infinite]`}
        />
        <div className="absolute top-[900px] -left-32 w-96 h-96 rounded-full blur-3xl opacity-40 bg-violet-300/30 animate-[liquidFloat_13s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-30 bg-cyan-300/30 animate-[liquidFloat_9s_ease-in-out_infinite]" />
      </div>

      {/* Scroll bar */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Hero Section */}
      <div className="student-hero relative w-full h-[580px] overflow-hidden">
        <img
          src={lessonBanner}
          alt="Curriculum Banner"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.1)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 flex items-center pt-[66px]">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 bg-white/10 border border-white/25 backdrop-blur-sm">
                <GraduationCap className="h-4 w-4 text-cyan-300" />
                <span className="text-xs font-semibold text-white uppercase tracking-widest">
                  {getMajorDisplayName()}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
                  Curriculum
                </span>
              </h1>
              <p className="text-lg text-gray-200 max-w-xl">
                The curriculum of {getMajorDisplayName()} Department is designed
                to equip students with abilities to use new technologies and
                theories to design and develop software solutions
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-12">
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative w-full pl-11 pr-4 py-3 rounded-full border border-white/70 bg-white/50 backdrop-blur-xl shadow-[0_8px_24px_-8px_rgba(30,27,75,0.15)] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/70 transition-colors placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Year tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-1 p-1.5 bg-white/45 backdrop-blur-xl rounded-2xl border border-white/70 shadow-[0_8px_24px_-8px_rgba(30,27,75,0.15)]">
            {YEAR_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveYear(tab);
                  setSearchTerm("");
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeYear === tab
                    ? `bg-gradient-to-r ${getMajorStyle(selectedMajor, tab).grad} text-white shadow-lg`
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Year label */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className={`h-px flex-1 bg-gradient-to-r ${style.grad} opacity-30`}
          />
          <span
            className={`text-xs font-bold uppercase tracking-widest ${style.accent} flex items-center gap-2`}
          >
            <Award className="h-3.5 w-3.5" />
            {activeYear} — {sem1Subjects.length + sem2Subjects.length} subjects
          </span>
          <div
            className={`h-px flex-1 bg-gradient-to-l ${style.grad} opacity-30`}
          />
        </div>

        {/* Semester cards */}
        <div className="flex flex-col lg:flex-row gap-6">
          <SemesterCard
            semLabel="SEMESTER I"
            subjects={sem1Subjects}
            style={style}
            onSubjectClick={setSelectedSubject}
          />
          <SemesterCard
            semLabel="SEMESTER II"
            subjects={sem2Subjects}
            style={style}
            onSubjectClick={setSelectedSubject}
          />
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center gap-3 text-gray-600 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-xl backdrop-saturate-150 border border-white/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> L = Lecture
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-xl backdrop-saturate-150 border border-white/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> P = Practice
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-xl backdrop-saturate-150 border border-white/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> S = Self
            Study
          </span>
        </div>
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSubject(null)}
        >
          <div
            className="student-glass-modal relative overflow-hidden bg-white/45 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 rounded-[28px] max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_28px_70px_-15px_rgba(30,27,75,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`relative overflow-hidden p-6 bg-gradient-to-r ${style.grad} backdrop-blur-md text-white`}
            >
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/40" />
              <div className="pointer-events-none absolute -inset-y-10 -left-1/4 w-1/3 rotate-[14deg] bg-gradient-to-r from-transparent via-white/40 to-transparent mix-blend-overlay animate-[liquidShine_8s_ease-in-out_infinite]" />
              <h3 className="relative text-2xl font-bold">
                {selectedSubject.title}
              </h3>
              <p className="relative text-white/80 mt-2">
                {selectedSubject.description || "No description available"}
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/40 backdrop-blur-xl backdrop-saturate-150 border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] p-3 rounded-2xl">
                  <span className="text-xs text-gray-500">Credit</span>
                  <p className={`text-xl font-bold ${style.accent}`}>
                    {selectedSubject.credit}
                  </p>
                </div>
                <div className="bg-white/40 backdrop-blur-xl backdrop-saturate-150 border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] p-3 rounded-2xl">
                  <span className="text-xs text-gray-500">Hours</span>
                  <p className={`text-xl font-bold ${style.accent}`}>
                    {selectedSubject.hours || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubject(null)}
                className={`w-full py-3 bg-gradient-to-r ${style.grad} text-white rounded-xl font-semibold hover:brightness-110 shadow-lg transition-all`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
