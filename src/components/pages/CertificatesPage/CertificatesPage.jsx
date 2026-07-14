import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BarChart2,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Download,
  Eye,
  Filter,
  FolderKanban,
  LogOut,
  Menu,
  Printer,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { profileApi } from "../../api/profile";
import logo from "../../assets/image/logo.png";

import {
  MAJORS,
  MAJOR_COLORS,
  formatDate,
  certificateFileName,
  certificateImage,
  printPopupWhenReady,
  buildCertificateHtml,
} from "./certificateUtils";
const CertificatesPage = ({
  user,
  onLogout,
  embedded = false,
  onReportDataChange,
}) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersData, certData] = await Promise.all([
        profileApi.getUsers(),
        profileApi.getAllCertificates(),
      ]);
      setStudents(usersData.filter((item) => item.role === "student"));
      setCertificates(certData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const certificateByUser = useMemo(() => {
    const map = new Map();
    for (const certificate of certificates) {
      if (!certificate.userId) continue;
      const key = `${certificate.userId}:${certificate.studentMajor || certificate.examMajor || ""}`;
      if (!map.has(key)) map.set(key, certificate);
    }
    return map;
  }, [certificates]);

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesMajor =
        selectedMajor === "all" || student.major === selectedMajor;
      const matchesSearch =
        !q ||
        (student.name || "").toLowerCase().includes(q) ||
        (student.email || "").toLowerCase().includes(q) ||
        (student.major || "").toLowerCase().includes(q);
      return matchesMajor && matchesSearch;
    });
  }, [searchTerm, selectedMajor, students]);

  const visibleCertificates = useMemo(() => {
    return certificates.filter((certificate) => {
      const matchesMajor =
        selectedMajor === "all" ||
        certificate.studentMajor === selectedMajor ||
        certificate.examMajor === selectedMajor;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (certificate.studentName || "").toLowerCase().includes(q) ||
        (certificate.studentEmail || "").toLowerCase().includes(q) ||
        (certificate.title || "").toLowerCase().includes(q);
      return matchesMajor && matchesSearch;
    });
  }, [certificates, searchTerm, selectedMajor]);

  useEffect(() => {
    onReportDataChange?.({
      certificates: visibleCertificates,
      selectedMajor,
      searchTerm,
    });
  }, [onReportDataChange, searchTerm, selectedMajor, visibleCertificates]);

  const stats = useMemo(() => {
    const counts = {
      students: filteredStudents.length,
      certificates: visibleCertificates.length,
      ite: students.filter((student) => student.major === "ITE").length,
      math: students.filter((student) => student.major === "Mathematics")
        .length,
    };
    return counts;
  }, [filteredStudents.length, students, visibleCertificates.length]);

  const displayUser = {
    name: user?.name || "Admin",
    email: user?.email || "",
  };

  const handleAdminNav = (id) => {
    if (id === "certificates") {
      setSidebarOpen(false);
      return;
    }
    navigate("/admin/dashboard", { state: { activeTab: id } });
    setSidebarOpen(false);
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "teachers", label: "Teachers", icon: UserCheck },
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      <div className=" border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <img src={logo} alt="Elearning Logo" className="w-full h-full" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">
              Elearning
            </p>
            <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "certificates";
          return (
            <button
              key={item.id}
              onClick={() => handleAdminNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
              {item.id === "users" && students.length > 0 && (
                <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {students.length}
                </span>
              )}
              {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
            {displayUser.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {displayUser.name}
            </p>
            <p className="text-slate-500 text-xs truncate">
              {displayUser.email}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  const generateCertificate = async (student) => {
    try {
      setSavingId(student.id);
      setError("");
      setMessage("");
      const certificate = await profileApi.generateCertificate({
        userId: student.id,
        major: student.major,
        title: `${student.major} Achievement Certificate`,
      });
      await loadData();
      setSelectedCertificate(certificate);
      setMessage(`Certificate generated for ${student.name}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const deleteCertificate = async (certificate) => {
    const studentName =
      certificate.studentName || certificate.studentEmail || "this student";
    if (!window.confirm(`Delete certificate for ${studentName}?`)) return;

    try {
      setDeletingId(certificate.id);
      setError("");
      setMessage("");
      await profileApi.deleteCertificate(certificate.id);
      setCertificates((items) =>
        items.filter((item) => item.id !== certificate.id),
      );
      if (selectedCertificate?.id === certificate.id) {
        setSelectedCertificate(null);
      }
      setMessage("Certificate deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const downloadCertificate = (certificate) => {
    const html = buildCertificateHtml(certificate);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${certificateFileName(certificate)}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const printCertificate = (certificate) => {
    const popup = window.open("", "_blank");
    if (!popup) {
      downloadCertificate(certificate);
      return;
    }
    popup.document.write(buildCertificateHtml(certificate));
    popup.document.close();
    printPopupWhenReady(popup);
  };

  return (
    <>
      <style>{`
        .cert-admin-root {
          min-height: calc(100vh - 65px);
          padding: 0;
          background:
            radial-gradient(circle at top left, rgba(79, 70, 229, 0.22), transparent 30rem),
            radial-gradient(circle at top right, rgba(6, 182, 212, 0.14), transparent 28rem),
            linear-gradient(180deg, #060817 0%, #0b1024 100%);
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
        }
        .cert-admin-root.embedded {
          min-height: 0;
          background: transparent;
        }
        .cert-admin-shell {
          width: 100%;
          margin: 0;
          padding: 20px 16px 36px;
        }
        .cert-admin-root.embedded .cert-admin-shell {
          padding: 0;
        }
        .admin-panel {
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(24, 31, 58, 0.98));
          border: 1px solid rgba(129, 140, 248, 0.22);
          border-radius: 16px;
          box-shadow: 0 18px 50px rgba(2, 6, 23, 0.26);
        }
        .admin-card {
          background:
            linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(24, 31, 58, 0.96));
          border: 1px solid rgba(129, 140, 248, 0.22);
          border-radius: 16px;
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.18);
        }
        .admin-input {
          width: 100%;
          background: #020617;
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
        }
        .admin-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16);
        }
        .admin-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          padding: 10px 13px;
          font-size: 13px;
          font-weight: 800;
          transition: all 0.15s ease;
        }
        .admin-btn.primary {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.24);
        }
        .admin-btn.primary:hover {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
        .admin-btn.secondary {
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
        }
        .admin-btn.secondary:hover {
          color: #fff;
          border-color: #64748b;
        }
        .admin-btn.danger {
          background: #450a0a;
          color: #fecaca;
          border: 1px solid #7f1d1d;
        }
        .admin-btn.danger:hover {
          background: #7f1d1d;
          color: #fff;
        }
        .admin-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .major-pill {
          border: 1px solid rgba(148, 163, 184, 0.26);
          color: #dbeafe;
          background: rgba(15, 23, 42, 0.72);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 800;
        }
        .major-pill.active {
          color: #fff;
          border-color: #818cf8;
          background: linear-gradient(135deg, #4338ca, #6d28d9);
          box-shadow: 0 10px 24px rgba(79, 70, 229, 0.26);
        }
        .student-row {
          display: grid;
          grid-template-columns: minmax(240px, 2fr) minmax(120px, 0.55fr) minmax(120px, 0.55fr) minmax(260px, 0.9fr);
          gap: 16px;
          align-items: center;
          padding: 12px 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.16);
        }
        .students-panel {
          width: 100%;
        }
        .student-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: nowrap;
        }
        .certificate-card {
          overflow: hidden;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(24, 31, 58, 0.96));
          border: 1px solid rgba(129, 140, 248, 0.22);
          border-radius: 16px;
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.18);
        }

        .cert-admin-root h1,
        .cert-admin-root h2,
        .cert-admin-root h3,
        .cert-admin-root .text-white {
          color: #f8fbff !important;
        }

        .cert-admin-root .text-slate-400,
        .cert-admin-root .text-slate-500,
        .cert-admin-root .text-slate-600 {
          color: #9fb0d0 !important;
        }

        .cert-admin-root .student-row:hover {
          background: rgba(99, 102, 241, 0.08);
        }

        html:not(.dark-mode) .cert-admin-root {
          background:
            radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 34rem),
            linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%) !important;
          color: #0f172a !important;
        }

        html:not(.dark-mode) .cert-admin-root.embedded {
          background: transparent !important;
        }

        html:not(.dark-mode) .cert-admin-root .admin-panel,
        html:not(.dark-mode) .cert-admin-root .admin-card,
        html:not(.dark-mode) .cert-admin-root .certificate-card {
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.96)) !important;
          border-color: #dbe6f5 !important;
          box-shadow: 0 18px 42px rgba(37, 56, 88, 0.09) !important;
        }

        html:not(.dark-mode) .cert-admin-root .admin-card {
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 255, 0.96)) !important;
        }

        html:not(.dark-mode) .cert-admin-root .students-panel {
          background:
            linear-gradient(180deg, #ffffff 0%, #fbfdff 100%) !important;
        }

        html:not(.dark-mode) .cert-admin-root h1,
        html:not(.dark-mode) .cert-admin-root h2,
        html:not(.dark-mode) .cert-admin-root h3,
        html:not(.dark-mode) .cert-admin-root .text-white,
        html:not(.dark-mode) .cert-admin-root .text-slate-200,
        html:not(.dark-mode) .cert-admin-root .text-slate-300 {
          color: #0f172a !important;
        }

        html:not(.dark-mode) .cert-admin-root .text-slate-400,
        html:not(.dark-mode) .cert-admin-root .text-slate-500,
        html:not(.dark-mode) .cert-admin-root .text-slate-600,
        html:not(.dark-mode) .cert-admin-root p {
          color: #64748b !important;
        }

        html:not(.dark-mode) .cert-admin-root .admin-input {
          background: #ffffff !important;
          border-color: #c8d7ee !important;
          color: #0f172a !important;
          box-shadow:
            inset 0 1px 0 rgba(15, 23, 42, 0.03),
            0 10px 22px rgba(37, 56, 88, 0.05);
        }

        html:not(.dark-mode) .cert-admin-root .admin-input.pl-10 {
          padding-left: 2.5rem !important;
        }

        html:not(.dark-mode) .cert-admin-root .admin-input::placeholder {
          color: #718096 !important;
        }

        html:not(.dark-mode) .cert-admin-root .student-row {
          border-top-color: #e6eef8 !important;
          background: rgba(255, 255, 255, 0.64);
        }

        html:not(.dark-mode) .cert-admin-root .student-row:hover {
          background: #f3f7ff !important;
          box-shadow: inset 3px 0 0 #6366f1;
        }

        html:not(.dark-mode) .cert-admin-root .students-panel > .hidden {
          border-top-color: #dbe6f5 !important;
          background: linear-gradient(180deg, #f7faff, #f0f5ff) !important;
        }

        html:not(.dark-mode) .cert-admin-root .student-row .text-white,
        html:not(.dark-mode) .cert-admin-root .major-pill.active,
        html:not(.dark-mode) .cert-admin-root .admin-btn.primary {
          color: #ffffff !important;
        }

        html:not(.dark-mode) .cert-admin-root .student-row p.text-white {
          color: #0f172a !important;
        }

        html:not(.dark-mode) .cert-admin-root .major-pill,
        html:not(.dark-mode) .cert-admin-root .admin-btn.secondary {
          background: #ffffff !important;
          color: #334155 !important;
          border-color: #c8d7ee !important;
          box-shadow: 0 8px 18px rgba(37, 56, 88, 0.05);
        }

        html:not(.dark-mode) .cert-admin-root .major-pill:hover,
        html:not(.dark-mode) .cert-admin-root .admin-btn.secondary:hover {
          background: #f0f5ff !important;
          color: #1e293b !important;
          border-color: #aebff8 !important;
          transform: translateY(-1px);
        }

        html:not(.dark-mode) .cert-admin-root .major-pill.active {
          background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
          border-color: transparent !important;
          color: #ffffff !important;
        }

        html:not(.dark-mode) .cert-admin-root .admin-btn.danger {
          background: #fff5f5 !important;
          color: #991b1b !important;
          border-color: #fecaca !important;
        }

        html:not(.dark-mode) .cert-admin-root .admin-btn.danger:hover {
          background: #fee2e2 !important;
          color: #7f1d1d !important;
        }

        html:not(.dark-mode) .cert-admin-root .certificate-card .text-white,
        html:not(.dark-mode) .cert-admin-root .certificate-card .text-white\\/70,
        html:not(.dark-mode) .cert-admin-root .certificate-card .text-indigo-200 {
          color: #ffffff !important;
        }

        html.dark-mode .cert-admin-root {
          background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.20), transparent 30rem),
            radial-gradient(circle at top right, rgba(6, 182, 212, 0.13), transparent 28rem),
            linear-gradient(180deg, #070816 0%, #10122a 100%) !important;
          color: #f4f7ff !important;
        }

        html.dark-mode .cert-admin-root.embedded {
          background: transparent !important;
        }

        html.dark-mode .cert-admin-root .admin-panel,
        html.dark-mode .cert-admin-root .admin-card,
        html.dark-mode .cert-admin-root .certificate-card {
          background: rgba(21, 23, 51, 0.96) !important;
          border-color: #2b315f !important;
          box-shadow: 0 20px 54px rgba(0, 0, 0, 0.42) !important;
        }

        html.dark-mode .cert-admin-root .admin-input {
          background: #10142e !important;
          border-color: #2b315f !important;
          color: #f4f7ff !important;
        }

        /* --- Professional certificate preview (modal) --- */
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Great+Vibes&family=EB+Garamond:wght@400;500;600&display=swap');

        .certificate-preview {
          aspect-ratio: 1.414 / 1;
          min-height: 420px;
          margin: 20px;
          padding: clamp(28px, 5vw, 56px) clamp(24px, 6vw, 64px);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
          background: #fffdf8;
          color: #16181d;
          font-family: "EB Garamond", Georgia, serif;
          overflow: hidden;
        }
        .certificate-preview::before {
          content: "";
          position: absolute;
          inset: 12px;
          border: 3px solid var(--cert-accent);
          pointer-events: none;
        }
        .certificate-preview::after {
          content: "";
          position: absolute;
          inset: 19px;
          border: 1px solid var(--cert-accent);
          opacity: 0.55;
          pointer-events: none;
        }
        .cert-corner {
          position: absolute;
          width: 34px;
          height: 34px;
          border: 2px solid var(--cert-accent);
          z-index: 2;
        }
        .cert-corner.tl { top: 22px; left: 22px; border-right: none; border-bottom: none; }
        .cert-corner.tr { top: 22px; right: 22px; border-left: none; border-bottom: none; }
        .cert-corner.bl { bottom: 22px; left: 22px; border-right: none; border-top: none; }
        .cert-corner.br { bottom: 22px; right: 22px; border-left: none; border-top: none; }
        .cert-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 42%;
          transform: translate(-50%, -50%);
          opacity: 0.05;
          z-index: 0;
          pointer-events: none;
        }
        .cert-body-content { position: relative; z-index: 1; }
        .cert-crest {
          width: 72px;
          height: 72px;
          margin: 0 auto 8px;
          border-radius: 50%;
          background: #fff;
          padding: 3px;
          box-shadow: 0 0 0 3px var(--cert-accent), 0 6px 16px rgba(0,0,0,0.16);
        }
        .cert-crest img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
        .cert-issuer {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #3f3f3f;
          margin: 0;
        }
        .certificate-preview h2 {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-weight: 600;
          font-size: clamp(30px, 5vw, 48px);
          margin: 6px 0 0;
          color: #16181d;
        }
        .cert-divider {
          width: 80px;
          height: 2px;
          background: var(--cert-accent);
          opacity: 0.7;
          margin: 14px auto;
        }
        .student-name {
          font-family: "Great Vibes", cursive;
          font-size: clamp(32px, 5vw, 50px);
          color: #16181d;
          margin: 4px auto 12px;
          line-height: 1.2;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(2, 6, 23, 0.76);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .modal-panel {
          width: min(980px, 100%);
          max-height: 92vh;
          overflow: auto;
          background: #fff;
          color: #111827;
          border-radius: 16px;
          box-shadow: 0 24px 80px rgba(2, 6, 23, 0.45);
        }
        .cert-admin-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px;
          background: rgba(2, 6, 23, 0.84);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #1e293b;
        }
        @media (min-width: 768px) {
          .cert-admin-shell {
            padding: 24px 32px 40px;
          }
          .cert-admin-topbar {
            padding: 16px 32px;
          }
        }
        @media (max-width: 900px) {
          .student-row {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 16px;
          }
          .student-row > div:last-child {
            flex-wrap: wrap;
            justify-content: flex-start;
          }
          .student-row > div:last-child .admin-btn {
            flex: 1 1 136px;
          }
          .certificate-preview {
            min-height: 0;
            margin: 12px;
          }
        }
        @media (max-width: 640px) {
          .cert-admin-shell {
            padding: 18px 12px 32px;
          }
          .cert-admin-topbar {
            padding: 12px;
          }
          .admin-btn {
            padding: 9px 11px;
          }
          .major-pill {
            flex: 1 1 calc(50% - 4px);
            text-align: center;
          }
        }
      `}</style>

      <div
        className={`${embedded ? "min-h-0" : "min-h-screen"} text-white`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {!embedded && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`${embedded ? "hidden" : "hidden md:flex"} fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-30 flex-col`}
        >
          <SidebarContent />
        </aside>

        <aside
          className={`${embedded ? "hidden" : "fixed"} left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col md:hidden transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent />
        </aside>

        <main className={embedded ? "min-h-0" : "md:ml-64 min-h-screen"}>
          <header className={embedded ? "hidden" : "cert-admin-topbar"}>
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-white truncate">
                  Certificate Management
                </h1>
                <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">
                  Welcome back, {displayUser.name?.split(" ")[0] || "Admin"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button
                onClick={loadData}
                title="Refresh"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <div className="w-px h-5 bg-slate-700 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-indigo-300 text-xs font-semibold">
                  ADMIN
                </span>
              </div>
            </div>
          </header>

          <div className={`cert-admin-root ${embedded ? "embedded" : ""}`}>
            <div className="cert-admin-shell">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-indigo-400">
                    Admin certificates
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black text-white mt-2">
                    Generate Student Certificates
                  </h1>
                  <p className="text-slate-400 mt-2">
                    Filter students by major, issue certificates, and print them
                    with student name and major.
                  </p>
                </div>
                <button
                  className="admin-btn secondary"
                  onClick={loadData}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: "Visible students",
                    value: stats.students,
                    icon: Users,
                    color: "#818cf8",
                  },
                  {
                    label: "Certificates",
                    value: stats.certificates,
                    icon: Award,
                    color: "#34d399",
                  },
                  {
                    label: "ITE students",
                    value: stats.ite,
                    icon: BookOpen,
                    color: "#60a5fa",
                  },
                  {
                    label: "Math students",
                    value: stats.math,
                    icon: CheckCircle,
                    color: "#a78bfa",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="admin-card p-4">
                      <div className="flex items-center justify-between">
                        <Icon
                          className="h-5 w-5"
                          style={{ color: item.color }}
                        />
                        <span className="text-xs text-slate-500">Live</span>
                      </div>
                      <p className="text-2xl font-black text-white mt-3">
                        {item.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="admin-panel p-4 md:p-5 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      className="admin-input pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search student name, email, or major..."
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MAJORS.map((major) => (
                      <button
                        key={major}
                        type="button"
                        className={`major-pill ${selectedMajor === major ? "active" : ""}`}
                        onClick={() => setSelectedMajor(major)}
                      >
                        <Filter className="inline h-3.5 w-3.5 mr-1" />
                        {major === "all" ? "All Majors" : major}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {message && (
                <div className="mb-5 rounded-xl border border-emerald-900 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-300">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-xl border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <section className="admin-panel students-panel overflow-hidden mb-6">
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Students by Major
                    </h2>
                    <p className="text-xs text-slate-500">
                      Generate a certificate from each student row.
                    </p>
                  </div>
                  {loading && (
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                  )}
                </div>

                <div className="hidden md:grid grid-cols-[minmax(240px,2fr)_minmax(120px,0.55fr)_minmax(120px,0.55fr)_minmax(260px,0.9fr)] gap-4 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 border-t border-slate-800">
                  <span>Student</span>
                  <span>Major</span>
                  <span>Status</span>
                  <span className="text-right">Action</span>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="px-4 py-12 text-center text-slate-500">
                    No students found for this filter.
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    const certKey = `${student.id}:${student.major || ""}`;
                    const issuedCertificate = certificateByUser.get(certKey);
                    return (
                      <div key={student.id} className="student-row">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{
                              background:
                                MAJOR_COLORS[student.major] || "#4f46e5",
                            }}
                          >
                            {(student.name || "S").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span
                            className="inline-flex rounded-full px-2.5 py-1 text-xs font-black text-white"
                            style={{
                              background:
                                MAJOR_COLORS[student.major] || "#475569",
                            }}
                          >
                            {student.major || "No major"}
                          </span>
                        </div>
                        <div className="text-sm">
                          {issuedCertificate ? (
                            <span className="inline-flex items-center gap-1 text-emerald-300">
                              <CheckCircle className="h-4 w-4" />
                              Issued
                            </span>
                          ) : (
                            <span className="text-slate-500">Not issued</span>
                          )}
                        </div>
                        <div className="student-actions">
                          {issuedCertificate && (
                            <>
                              <button
                                className="admin-btn secondary"
                                onClick={() =>
                                  printCertificate(issuedCertificate)
                                }
                              >
                                <Printer className="h-4 w-4" />
                                Print
                              </button>
                              <button
                                className="admin-btn danger"
                                disabled={deletingId === issuedCertificate.id}
                                onClick={() =>
                                  deleteCertificate(issuedCertificate)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingId === issuedCertificate.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </>
                          )}
                          <button
                            className="admin-btn primary"
                            disabled={!student.major || savingId === student.id}
                            onClick={() => generateCertificate(student)}
                          >
                            <Award className="h-4 w-4" />
                            {savingId === student.id
                              ? "Generating..."
                              : issuedCertificate
                                ? "Regenerate"
                                : "Generate"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {visibleCertificates.map((certificate) => (
                  <article key={certificate.id} className="certificate-card">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={
                          certificate.image ||
                          certificateImage(
                            certificate.title,
                            certificate.accentColor,
                          )
                        }
                        alt={certificate.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs font-black uppercase tracking-widest text-indigo-200">
                          {certificate.studentMajor ||
                            certificate.examMajor ||
                            "Major"}
                        </p>
                        <h3 className="text-lg font-black text-white">
                          {certificate.title}
                        </h3>
                        <p className="text-sm text-white/70">
                          {certificate.studentName || certificate.studentEmail}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                        <div>
                          <p className="text-xs text-slate-600">Issued</p>
                          <p className="text-slate-200 font-semibold">
                            {formatDate(certificate.issueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Credential</p>
                          <p className="text-slate-200 font-mono text-xs truncate">
                            {certificate.credentialId}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          className="admin-btn secondary"
                          onClick={() => setSelectedCertificate(certificate)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          className="admin-btn secondary"
                          onClick={() => printCertificate(certificate)}
                        >
                          <Printer className="h-4 w-4" />
                          Print
                        </button>
                        <button
                          className="admin-btn secondary"
                          onClick={() => downloadCertificate(certificate)}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          className="admin-btn danger"
                          disabled={deletingId === certificate.id}
                          onClick={() => deleteCertificate(certificate)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === certificate.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </div>
          </div>
        </main>
      </div>

      {selectedCertificate && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500">
                  Certificate preview
                </p>
                <h2 className="text-lg font-black text-gray-900">
                  {selectedCertificate.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="admin-btn secondary"
                  onClick={() => printCertificate(selectedCertificate)}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  className="admin-btn primary"
                  onClick={() => downloadCertificate(selectedCertificate)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  className="admin-btn danger"
                  disabled={deletingId === selectedCertificate.id}
                  onClick={() => deleteCertificate(selectedCertificate)}
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === selectedCertificate.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
                <button
                  className="admin-btn secondary"
                  onClick={() => setSelectedCertificate(null)}
                  aria-label="Close certificate preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div
              className="certificate-preview"
              style={{
                "--cert-accent":
                  selectedCertificate.accentColor ||
                  MAJOR_COLORS[selectedCertificate.studentMajor] ||
                  "#b8860b",
              }}
            >
              <div className="cert-corner tl"></div>
              <div className="cert-corner tr"></div>
              <div className="cert-corner bl"></div>
              <div className="cert-corner br"></div>
              <img className="cert-watermark" src={logo} alt="" />
              <div className="cert-body-content">
                <div className="cert-crest">
                  <img src={logo} alt="University Seal" />
                </div>
                <p className="cert-issuer">
                  {selectedCertificate.issuer ||
                    "Royal University of Phnom Penh"}
                </p>
                <p
                  className="text-xs font-black uppercase tracking-[0.28em] mt-3"
                  style={{
                    color:
                      selectedCertificate.accentColor ||
                      MAJOR_COLORS[selectedCertificate.studentMajor] ||
                      "#b8860b",
                  }}
                >
                  Certificate of Achievement
                </p>
                <h2>{selectedCertificate.title || "Academic Achievement"}</h2>
                <div className="cert-divider"></div>
                <p className="text-gray-500 uppercase tracking-wide text-sm">
                  This certificate is proudly presented to
                </p>
                <div className="student-name">
                  {selectedCertificate.studentName ||
                    selectedCertificate.studentEmail ||
                    "Student"}
                </div>
                <p className="max-w-2xl mx-auto text-gray-600 leading-7">
                  For successfully demonstrating outstanding achievement in{" "}
                  <span
                    className="font-semibold text-gray-900"
                    style={{
                      borderBottom: `1px solid ${
                        selectedCertificate.accentColor ||
                        MAJOR_COLORS[selectedCertificate.studentMajor] ||
                        "#b8860b"
                      }`,
                    }}
                  >
                    {selectedCertificate.studentMajor ||
                      selectedCertificate.examMajor ||
                      "Major"}
                  </span>
                  , fulfilling all requirements with distinction.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 text-sm text-gray-600">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                      Date Issued
                    </p>
                    <div className="border-t border-gray-300 pt-2">
                      {formatDate(selectedCertificate.issueDate)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                      Grade
                    </p>
                    <div className="border-t border-gray-300 pt-2">
                      {selectedCertificate.grade || "Complete"}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
                      Headteacher Signature
                    </p>
                    <div className="border-t border-gray-300 pt-2">
                      &nbsp;
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 absolute left-8 bottom-6 z-10">
                Credential ID: {selectedCertificate.credentialId || "PREVIEW"}
              </p>
              <p className="text-[11px] text-gray-400 absolute right-8 bottom-6 z-10">
                Verified Digital Record
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificatesPage;
