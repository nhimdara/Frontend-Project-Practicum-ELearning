import React, { useState } from "react";
import {
  Award, Download, Share2, Calendar, BookOpen,
  CheckCircle, Search, Eye
} from "lucide-react";

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const certificates = [
    { id: 1, title: "Advanced React Development", issuer: "LearnFlow Academy", issueDate: "February 15, 2026", expiryDate: "Never", credentialId: "LF-REACT-2026-001", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", skills: ["React", "Hooks", "Redux", "Next.js"], grade: "A", hours: 40, verified: true, accentColor: "#6366f1" },
    { id: 2, title: "UI/UX Design Professional", issuer: "Design Institute", issueDate: "January 20, 2026", expiryDate: "January 20, 2028", credentialId: "DI-UX-2026-042", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", skills: ["Figma", "User Research", "Prototyping", "Wireframing"], grade: "A-", hours: 35, verified: true, accentColor: "#10b981" },
    { id: 3, title: "Full Stack JavaScript", issuer: "LearnFlow Academy", issueDate: "December 10, 2025", expiryDate: "Never", credentialId: "LF-JS-2025-089", image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", skills: ["Node.js", "Express", "MongoDB", "REST APIs"], grade: "A", hours: 60, verified: true, accentColor: "#0ea5e9" },
    { id: 4, title: "Python for Data Science", issuer: "Data Science Academy", issueDate: "November 5, 2025", expiryDate: "November 5, 2027", credentialId: "DSA-PY-2025-123", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", skills: ["Python", "Pandas", "NumPy", "Matplotlib"], grade: "B+", hours: 45, verified: true, accentColor: "#f59e0b" },
  ];

  const filtered = certificates.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@700;800&display=swap');
        
        .cert-root { 
          font-family: 'DM Sans', sans-serif; 
          background: linear-gradient(160deg, #f8f8ff, #f0f0fe);
          min-height: 100vh;
          padding-top: 96px;
          padding-bottom: 64px;
        }
        
        .cert-heading { 
          font-family: 'Playfair Display', serif; 
        }
        
        .cert-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #f0f0f8;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: transform 0.25s, box-shadow 0.25s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .cert-card:hover { 
          transform: translateY(-6px); 
          box-shadow: 0 16px 48px rgba(99,102,241,0.14); 
        }
        
        .stat-box {
          background: white;
          border-radius: 20px;
          border: 1px solid #f0f0f8;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        
        .skill-tag {
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          background: #f3f4f6;
          color: #6b7280;
          transition: all 0.15s;
        }
        
        .skill-tag:hover { 
          background: #e0e7ff; 
          color: #4f46e5; 
        }
        
        .cert-btn {
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 6px; 
          padding: 8px 16px; 
          border-radius: 12px;
          font-size: 13px; 
          font-weight: 600;
          cursor: pointer; 
          transition: all 0.2s;
          border: none;
        }
        
        .cert-btn-primary { 
          color: white; 
        }
        
        .cert-btn-outline { 
          background: white; 
          color: #374151; 
          border: 1.5px solid #e5e7eb; 
        }
        
        .cert-btn-outline:hover { 
          border-color: #a5b4fc; 
          color: #4f46e5; 
        }
        
        .cert-btn-icon { 
          background: white; 
          color: #374151; 
          border: 1.5px solid #e5e7eb; 
          padding: 8px; 
          border-radius: 10px; 
        }
        
        .cert-btn-icon:hover { 
          border-color: #a5b4fc; 
          color: #4f46e5; 
        }

        @media (max-width: 768px) {
          .cert-root {
            padding-top: 80px;
          }
          
          .cert-heading {
            font-size: 2rem;
          }
          
          .stat-box {
            padding: 16px;
          }
          
          .stat-box .w-12 {
            width: 40px;
            height: 40px;
          }
          
          .stat-box .text-2xl {
            font-size: 1.25rem;
          }
          
          .grid.grid-cols-1.md\\:grid-cols-2 {
            grid-template-columns: 1fr;
          }
          
          .cert-card .h-52 {
            height: 180px;
          }
        }

        @media (max-width: 640px) {
          .cert-root {
            padding-top: 72px;
          }
          
          .cert-heading {
            font-size: 1.75rem;
          }
          
          .flex.flex-col.sm\\:flex-row {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .stat-box {
            padding: 12px;
            gap: 12px;
          }
          
          .stat-box .w-12 {
            width: 36px;
            height: 36px;
          }
          
          .stat-box .w-12 svg {
            width: 18px;
            height: 18px;
          }
          
          .stat-box .text-2xl {
            font-size: 1.125rem;
          }
          
          .flex.flex-col.sm\\:flex-row.gap-3 {
            flex-direction: column;
          }
          
          .relative.flex-1 {
            max-width: 100%;
          }
          
          .cert-card .h-52 {
            height: 160px;
          }
          
          .cert-card .p-5 {
            padding: 16px;
          }
          
          .cert-card h3 {
            font-size: 16px;
          }
          
          .flex.gap-2.pt-4 {
            flex-wrap: wrap;
          }
          
          .flex.gap-2.pt-4 button {
            flex: 1;
          }
        }
      `}</style>

      <div className="cert-root">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-1">Achievements</p>
              <h1 className="cert-heading text-4xl font-bold text-gray-900">My Certificates</h1>
              <p className="text-gray-500 mt-1">Showcase your verified skills and accomplishments</p>
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}>
              <Share2 className="h-4 w-4" />
              Share Portfolio
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Certificates", value: certificates.length, icon: Award, color: "#6366f1", bg: "#eef2ff" },
              { label: "Skills Verified", value: 15, icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
              { label: "Learning Hours", value: "180", icon: BookOpen, color: "#8b5cf6", bg: "#faf5ff" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="stat-box">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                    <Icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-7">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                style={{ background: "white", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                onFocus={e => e.target.style.borderColor = "#a5b4fc"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
              style={{ background: "white", border: "1.5px solid #e5e7eb", color: "#374151", fontFamily: "DM Sans, sans-serif" }}
            >
              <option value="all">All Certificates</option>
              <option value="recent">Most Recent</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((cert) => (
              <div key={cert.id} className="cert-card">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />

                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: cert.accentColor }} />

                  {cert.verified && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: "#059669", backdropFilter: "blur(6px)" }}>
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}

                  <button className="absolute top-4 right-4 p-2 rounded-xl text-white"
                    style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}>
                    <Download className="h-4 w-4" />
                  </button>

                  {/* Grade badge */}
                  <div className="absolute bottom-4 right-4">
                    <span className="text-2xl font-black text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                      {cert.grade}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-4 left-4 right-16">
                    <h3 className="text-lg font-bold text-white leading-snug" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>
                      {cert.title}
                    </h3>
                    <p className="text-white/70 text-sm mt-0.5">{cert.issuer}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex flex-col gap-1.5 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>Issued: <span className="font-medium text-gray-800">{cert.issueDate}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs font-mono text-gray-500">{cert.credentialId}</span>
                    </div>
                    {cert.expiryDate !== "Never" && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Expires: {cert.expiryDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Skills Earned</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skills.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-500">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{cert.hours} learning hours</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4" style={{ borderTop: "1px solid #f3f4f6" }}>
                    <button className="cert-btn cert-btn-outline flex-1">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button className="cert-btn cert-btn-primary flex-1 text-white"
                      style={{ background: cert.accentColor, boxShadow: `0 4px 12px ${cert.accentColor}40` }}>
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                    <button className="cert-btn cert-btn-icon">
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: "#f3f4f6" }}>
                <Award className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No certificates found</h3>
              <p className="text-sm text-gray-500">Complete courses to earn your first certificate!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Certificates;