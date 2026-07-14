// pages/CalendarPage.jsx
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import {
  Search,
  ChevronDown,
  GraduationCap,
  Award,
  Loader2,
} from "lucide-react";
import lessonBanner from "./../assets/image/lessonpage.jpeg";

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
const MAJOR_OPTIONS = [
  {
    value: "ITE",
    label: "Information Technology Engineering (ITE)",
    icon: "💻",
  },
  { value: "IT", label: "Information Technology (IT)", icon: "🖥️" },
  { value: "Mathematics", label: "Mathematics", icon: "📐" },
];

const YEAR_STYLE = {
  Foundation: {
    grad: "from-indigo-600 to-violet-600",
    accent: "text-indigo-600",
    border: "border-indigo-300",
    rowHover: "hover:bg-indigo-50",
    tag: "bg-indigo-100 text-indigo-700",
  },
  "Second Year": {
    grad: "from-cyan-600 to-indigo-600",
    accent: "text-cyan-600",
    border: "border-cyan-300",
    rowHover: "hover:bg-cyan-50",
    tag: "bg-cyan-100 text-cyan-700",
  },
  "Third Year": {
    grad: "from-emerald-600 to-teal-600",
    accent: "text-emerald-600",
    border: "border-emerald-300",
    rowHover: "hover:bg-emerald-50",
    tag: "bg-emerald-100 text-emerald-700",
  },
  "Fourth Year": {
    grad: "from-amber-500 to-orange-600",
    accent: "text-amber-600",
    border: "border-amber-300",
    rowHover: "hover:bg-amber-50",
    tag: "bg-amber-100 text-amber-700",
  },
};

const getMajorStyle = (major, yearKey) => {
  const majorColors = {
    ITE: {
      grad: "from-indigo-600 to-violet-600",
      accent: "text-indigo-600",
      border: "border-indigo-300",
      rowHover: "hover:bg-indigo-50",
      tag: "bg-indigo-100 text-indigo-700",
    },
    IT: {
      grad: "from-cyan-600 to-blue-600",
      accent: "text-cyan-600",
      border: "border-cyan-300",
      rowHover: "hover:bg-cyan-50",
      tag: "bg-cyan-100 text-cyan-700",
    },
    Mathematics: {
      grad: "from-emerald-600 to-teal-600",
      accent: "text-emerald-600",
      border: "border-emerald-300",
      rowHover: "hover:bg-emerald-50",
      tag: "bg-emerald-100 text-emerald-700",
    },
  };
  return majorColors[major] || YEAR_STYLE[yearKey];
};

const SubjectRow = ({ subj, style, onClick }) => (
  <tr
    className={`border-b border-gray-200 ${style.rowHover} transition-colors duration-150 cursor-pointer group`}
    onClick={() => onClick(subj)}
  >
    <td className="py-3.5 px-4 text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">📘</span>
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
      <div
        className={`flex-1 min-w-0 rounded-2xl overflow-hidden border ${style.border} bg-white shadow-sm`}
      >
        <div className={`bg-gradient-to-r ${style.grad} px-5 py-4`}>
          <h3 className="text-white text-lg font-extrabold">{semLabel}</h3>
        </div>
        <div className="p-8 text-center text-gray-400">No subjects found</div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 min-w-0 rounded-2xl overflow-hidden border ${style.border} bg-white shadow-sm`}
    >
      <div
        className={`bg-gradient-to-r ${style.grad} px-5 py-4 flex items-center justify-between`}
      >
        <div>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            Programme
          </p>
          <h3 className="text-white text-lg font-extrabold tracking-tight italic">
            {semLabel}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1">
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
            <tr className={`border-b ${style.border} bg-gray-50`}>
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
          <tbody className="bg-white">
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
                  <td colSpan={3} className="pt-4 pb-1 px-4 bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
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
                  <td colSpan={3} className="pt-4 pb-1 px-4 bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
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
    </div>
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
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    const onMouse = (e) =>
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 18,
        y: (e.clientY / window.innerHeight - 0.5) * 18,
      });
    window.addEventListener("scroll", onScroll);
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <GraduationCap className="h-12 w-12 text-gray-400" />
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading curriculum...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800">
          Failed to load curriculum
        </h2>
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
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
          className="mt-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Scroll bar */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Hero Section */}
      <div className="relative w-full h-[580px] overflow-hidden">
        <img
          src={lessonBanner}
          alt="Curriculum Banner"
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
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-12">
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Year tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-1 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
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
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
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
        <div className="mt-8 flex items-center gap-6 text-gray-500 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> L = Lecture
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> P = Practice
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> S = Self Study
          </span>
        </div>
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSubject(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`p-6 bg-gradient-to-r ${style.grad} text-white rounded-t-2xl`}
            >
              <h3 className="text-2xl font-bold">{selectedSubject.title}</h3>
              <p className="text-white/80 mt-2">
                {selectedSubject.description || "No description available"}
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500">Credit</span>
                  <p className="text-xl font-bold">{selectedSubject.credit}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500">Hours</span>
                  <p className="text-xl font-bold">
                    {selectedSubject.hours || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubject(null)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
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
