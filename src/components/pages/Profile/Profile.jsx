import React, { useState, useRef, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap,
  BookOpen, Award, Globe, Github, Linkedin, Twitter,
  Camera, Save, X, Edit2, Check, Shield, Star,
  FolderGit2, Plus, Link, ExternalLink, Code2, Trash2,
  Upload, Image as ImageIcon
} from "lucide-react";
import { profileApi, syncStoredSession } from "../../api/profile";
import { API_BASE_URL } from "../../../config/api";

const PROJECT_MAJOR_PREFIX = "major:";

const makeAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=6366f1&color=fff&size=128`;

const normalizeProfile = (source = {}) => {
  const name = source.name || "Student";
  const role =
    source.dbRole === "student" ||
    source.role === "student" ||
    source.role === "Student"
      ? "client"
      : source.role || "client";
  return {
    id: source.id || null,
    name,
    email: source.email || "",
    avatar: source.avatar || makeAvatar(name),
    role,
    dbRole: source.dbRole || (role === "client" ? "student" : role),
    displayRole:
      role === "client" ? "Student" : role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student",
    joinDate: source.joinDate || source.created_at || new Date().toISOString(),
    major: source.major || "",
    progress: Number(source.progress || 0),
    coursesEnrolled: Number(source.coursesEnrolled || 0),
    certificates: Number(source.certificates || 0),
    achievements: Array.isArray(source.achievements) ? source.achievements : [],
    phone: source.phone || "",
    location: source.location || "",
    bio: source.bio || "",
    occupation: source.occupation || "Student",
    education: source.education || source.major || "",
    website: source.website || "",
    github: source.github || "",
    linkedin: source.linkedin || "",
    twitter: source.twitter || "",
    skills: Array.isArray(source.skills) ? source.skills : [],
    languages: Array.isArray(source.languages) ? source.languages : [],
  };
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const deferState = (fn) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    setTimeout(fn, 0);
  }
};

const readStoredProjects = (key) => {
  try {
    const savedProjects = localStorage.getItem(key);
    const parsedProjects = savedProjects ? JSON.parse(savedProjects) : [];
    return Array.isArray(parsedProjects) ? parsedProjects : [];
  } catch {
    return [];
  }
};

const writeStoredProjects = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private mode or when the quota is full.
  }
};

const Profile = ({ user: initialUser, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [newSkill, setNewSkill] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const projectStorageKey = initialUser?.id
    ? `learnflow_user_projects_${initialUser.id}`
    : "learnflow_user_projects";

  // Projects state
  const [projects, setProjects] = useState(() => {
    return readStoredProjects(projectStorageKey);
  });

  const [user, setUser] = useState(() => normalizeProfile(initialUser));
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [editForm, setEditForm] = useState({ ...user });

  useEffect(() => {
    let cancelled = false;
    const userId = initialUser?.id;

    if (!userId || String(userId).startsWith("user-")) {
      const normalized = normalizeProfile(initialUser);
      deferState(() => {
        if (cancelled) return;
        setUser(normalized);
        setEditForm(normalized);
      });
      return () => {
        cancelled = true;
      };
    }

    deferState(() => {
      if (cancelled) return;
      setProfileLoading(true);
      setProfileError("");
    });
    profileApi
      .getProfile(userId)
      .then((profile) => {
        if (cancelled) return;
        const normalized = normalizeProfile(profile);
        setUser(normalized);
        setEditForm(normalized);
        syncStoredSession(normalized);
        onUserUpdate?.(normalized);
      })
      .catch((err) => {
        if (!cancelled) setProfileError(err.message);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialUser?.id]);

  useEffect(() => {
    deferState(() => {
      setProjects(readStoredProjects(projectStorageKey));
    });
  }, [projectStorageKey]);

  useEffect(() => {
    writeStoredProjects(projectStorageKey, projects);
  }, [projects, projectStorageKey]);

  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    technologies: [],
    image: "",
    github: "",
    live: "",
    featured: false,
    category: "Software",
    completedDate: new Date().toISOString().split('T')[0]
  });
  const [techInput, setTechInput] = useState("");

  const handleInput = (e) => setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      const userId = user.id || initialUser?.id;
      let saved = normalizeProfile(editForm);
      if (userId && !String(userId).startsWith("user-")) {
        saved = normalizeProfile(await profileApi.updateProfile(userId, editForm));
        syncStoredSession(saved);
      }
      setUser(saved);
      setEditForm(saved);
      onUserUpdate?.(saved);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message);
    }
  };

  const handleCancel = () => { 
    setEditForm({ ...user }); 
    setIsEditing(false); 
  };

  const addSkill = () => {
    const currentSkills = Array.isArray(editForm.skills) ? editForm.skills : [];
    if (newSkill.trim() && !currentSkills.includes(newSkill.trim())) {
      setEditForm((p) => ({
        ...p,
        skills: [...currentSkills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (s) =>
    setEditForm((p) => ({
      ...p,
      skills: (p.skills || []).filter((x) => x !== s),
    }));

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setShowAvatarModal(true);
    }
  };

  const handleAvatarUpload = async () => {
    if (avatarPreview) {
      try {
        const userId = user.id || initialUser?.id;
        let updatedUser = normalizeProfile({ ...user, avatar: avatarPreview });
        if (userId && !String(userId).startsWith("user-")) {
          updatedUser = normalizeProfile(
            await profileApi.uploadAvatar(userId, avatarPreview),
          );
          syncStoredSession(updatedUser);
        }
        setUser(updatedUser);
        setEditForm({ ...editForm, avatar: updatedUser.avatar });
        onUserUpdate?.(updatedUser);
        setShowAvatarModal(false);
        setAvatarPreview(null);
        setSuccessMessage("Profile picture updated!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        setProfileError(err.message);
      }
    }
  };

  const handleAvatarCancel = () => {
    setShowAvatarModal(false);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenProjectModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({
        title: project.title,
        description: project.description,
        technologies: [...(project.technologies || [])],
        image: project.image,
        github: project.github || "",
        live: project.live || "",
        featured: false,
        category: project.category || "Software",
        completedDate: project.completedDate || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: "",
        description: "",
        technologies: [],
        image: "",
        github: "",
        live: "",
        featured: false,
        category: "Software",
        completedDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowProjectModal(true);
  };

  const handleProjectInput = (e) => {
    setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
  };

  const addTechnology = () => {
    if (techInput.trim() && !projectForm.technologies.includes(techInput.trim())) {
      setProjectForm({
        ...projectForm,
        technologies: [...projectForm.technologies, techInput.trim()]
      });
      setTechInput("");
    }
  };

  const removeTechnology = (tech) => {
    setProjectForm({
      ...projectForm,
      technologies: projectForm.technologies.filter(t => t !== tech)
    });
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || !projectForm.description || projectSubmitting) {
      return;
    }

    setProjectSubmitting(true);
    setProfileError("");
    const studentMajor = user.major || initialUser?.major || editForm.major || "";
    const majorTag = studentMajor ? `${PROJECT_MAJOR_PREFIX}${studentMajor}` : null;

    const projectPayload = {
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      image: projectForm.image.trim(),
      github_url: projectForm.github.trim(),
      live_url: projectForm.live.trim(),
      tags: majorTag
        ? [...new Set([...projectForm.technologies, majorTag])]
        : projectForm.technologies,
      major: studentMajor,
      student_major: studentMajor,
      student_id: user.id || initialUser?.id || null,
      student_name: user.name || initialUser?.name || "",
      featured: false,
      is_active: false,
      teacher_approved: false,
      admin_approved: false,
      approval_status: "teacher_pending",
    };

    try {
      const method = editingProject?.id ? "PUT" : "POST";
      const url = editingProject?.id
        ? `${API_BASE_URL}/projects/${editingProject.id}`
        : `${API_BASE_URL}/projects`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectPayload),
      });
      const savedProject = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(savedProject.error || "Could not submit project request.");
      }

      const requestedProject = {
        ...projectForm,
        id: savedProject.id || editingProject?.id || Date.now(),
        image:
          projectForm.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(projectForm.title)}&background=6366f1&color=fff&size=128`,
        featured: false,
        is_active: false,
        major: studentMajor,
        student_major: studentMajor,
        teacher_approved: false,
        admin_approved: false,
        approval_status: "teacher_pending",
        approvalStatus: "teacher_pending",
      };

      const updatedProjects = editingProject
        ? projects.map((p) => (p.id === editingProject.id ? requestedProject : p))
        : [...projects, requestedProject];

      setProjects(updatedProjects);
      writeStoredProjects(projectStorageKey, updatedProjects);
      setShowProjectModal(false);
      setSuccessMessage(
        editingProject
          ? "Project request updated. It will show publicly after approval."
          : "Project request submitted. It will show publicly after teacher and admin approval.",
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProjectSubmitting(false);
    }
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      writeStoredProjects(projectStorageKey, updatedProjects);
      setSuccessMessage("Project deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "skills", label: "Skills", icon: Star },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@700;800&display=swap');
        
        .prof-root { 
          font-family: 'DM Sans', sans-serif; 
          background: linear-gradient(160deg, #f8f8ff, #f0f0fe);
          min-height: 100vh;
          padding-top: 96px;
          padding-bottom: 64px;
        }
        
        .prof-heading { 
          font-family: 'Playfair Display', serif; 
        }
        
        .prof-card { 
          background: white; 
          border-radius: 24px; 
          border: 1px solid #f0f0f8; 
          box-shadow: 0 2px 20px rgba(0,0,0,0.04); 
          height: fit-content;
        }
        
        .form-field {
          width: 100%; 
          padding: 10px 14px; 
          border-radius: 12px; 
          font-size: 14px; 
          outline: none;
          border: 1.5px solid #e5e7eb; 
          background: #fafafa; 
          transition: all 0.15s; 
          font-family: 'DM Sans', sans-serif;
        }
        
        .form-field:focus { 
          border-color: #a5b4fc; 
          background: white; 
          box-shadow: 0 0 0 3px rgba(165,180,252,0.2); 
        }
        
        .tab-btn {
          display: flex; 
          align-items: center; 
          gap: 8px; 
          padding: 8px 18px;
          border-radius: 12px; 
          font-size: 14px; 
          font-weight: 600; 
          cursor: pointer;
          border: none; 
          background: transparent; 
          transition: all 0.15s; 
          font-family: 'DM Sans', sans-serif;
        }
        
        .tab-btn.active { 
          background: #eef2ff; 
          color: #4f46e5; 
        }
        
        .tab-btn:not(.active) { 
          color: #6b7280; 
        }
        
        .tab-btn:not(.active):hover { 
          background: #f9fafb; 
          color: #374151; 
        }
        
        .info-row { 
          display: flex; 
          gap: 12px; 
          padding: 12px 0; 
          border-bottom: 1px solid #f9fafb; 
        }
        
        .info-row:last-child { 
          border-bottom: none; 
        }
        
        .skill-chip {
          display: inline-flex; 
          align-items: center; 
          gap: 6px;
          padding: 5px 14px; 
          border-radius: 99px; 
          font-size: 13px; 
          font-weight: 600;
          background: #eef2ff; 
          color: #4f46e5; 
          border: 1.5px solid #c7d2fe;
          transition: all 0.15s;
        }
        
        .skill-chip:hover { 
          background: #e0e7ff; 
        }
        
        .success-toast {
          position: fixed; 
          top: 80px; 
          right: 20px; 
          z-index: 1000;
          background: white; 
          border: 1.5px solid #a7f3d0;
          border-radius: 14px; 
          padding: 12px 20px;
          display: flex; 
          align-items: center; 
          gap: 10px;
          box-shadow: 0 8px 32px rgba(16,185,129,0.15);
          animation: slideInRight 0.3s ease;
        }
        
        @keyframes slideInRight { 
          from { transform: translateX(100px); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
        
        .primary-btn {
          padding: 10px 20px; 
          border-radius: 14px; 
          font-size: 14px; 
          font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6); 
          color: white; 
          border: none; 
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3); 
          transition: all 0.2s; 
          font-family: 'DM Sans', sans-serif;
        }
        
        .primary-btn:hover { 
          opacity: 0.9; 
          transform: translateY(-1px); 
        }
        
        .ghost-btn {
          padding: 10px 20px; 
          border-radius: 14px; 
          font-size: 14px; 
          font-weight: 600;
          background: white; 
          color: #374151; 
          border: 1.5px solid #e5e7eb; 
          cursor: pointer;
          transition: all 0.15s; 
          font-family: 'DM Sans', sans-serif;
        }
        
        .ghost-btn:hover { 
          border-color: #a5b4fc; 
          color: #4f46e5; 
        }
        
        .project-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #f0f0f8;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(99,102,241,0.12);
        }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .modal-content {
          background: white;
          border-radius: 32px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          animation: modalFadeIn 0.3s ease;
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .tech-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #eef2ff;
          color: #4f46e5;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .avatar-upload-btn {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          border: 3px solid white;
        }
        
        .avatar-upload-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        
        .avatar-preview {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        @media (max-width: 1024px) {
          .prof-root .lg\\:col-span-1 {
            margin-bottom: 24px;
          }
          
          .prof-root .sticky {
            position: relative;
            top: 0;
          }
        }

        @media (max-width: 768px) {
          .prof-root {
            padding-top: 80px;
          }
          
          .prof-heading {
            font-size: 2rem;
          }
          
          .prof-root .flex-col.sm\\:flex-row {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .tab-btn {
            padding: 6px 12px;
            font-size: 13px;
          }
          
          .project-card .md\\:w-48 {
            width: 100%;
            height: 200px;
          }
          
          .project-card .md\\:w-48 img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .project-card .flex-1.p-6 {
            padding: 16px;
          }
          
          .modal-content {
            padding: 24px;
            margin: 16px;
          }
          
          .grid-cols-1.sm\\:grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .prof-root {
            padding-top: 72px;
          }
          
          .prof-heading {
            font-size: 1.75rem;
          }
          
          .avatar-upload-btn {
            width: 32px;
            height: 32px;
          }
          
          .avatar-upload-btn svg {
            width: 14px;
            height: 14px;
          }
          
          .prof-card.p-6 {
            padding: 16px;
          }
          
          .flex.items-center.gap-3.p-4 {
            flex-direction: column;
            text-align: center;
          }
          
          .flex.items-center.gap-3.p-4 button {
            width: 100%;
          }
          
          .project-card .flex-col.md\\:flex-row {
            flex-direction: column;
          }
          
          .project-card .flex.gap-4.mt-4 {
            flex-wrap: wrap;
          }
          
          .project-card .flex.gap-2.mt-4 {
            flex-wrap: wrap;
          }
          
          .project-card .flex.gap-2.mt-4 button {
            flex: 1;
          }
          
          .modal-content {
            padding: 20px;
          }
          
          .modal-content .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {showSuccess && (
        <div className="success-toast">
          <Check className="h-5 w-5 text-green-500" />
          <p className="text-sm font-semibold text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="modal-overlay" onClick={handleAvatarCancel}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Update Profile Picture</h3>
              
              <div className="flex justify-center mb-6">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="avatar-preview"
                />
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Preview your new profile picture. Click Save to confirm.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleAvatarUpload}
                  className="flex-1 primary-btn flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Save Avatar
                </button>
                <button
                  onClick={handleAvatarCancel}
                  className="flex-1 ghost-btn"
                >
                  Cancel
                </button>
              </div>

              <button
                onClick={handleAvatarClick}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Choose different image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingProject ? "Edit Project Request" : "Request Project Approval"}
              </h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={projectForm.title}
                  onChange={handleProjectInput}
                  className="form-field"
                  placeholder="e.g., Arduino Weather Station"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectInput}
                  rows={3}
                  className="form-field resize-none"
                  placeholder="Describe your project..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Technologies Used
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {projectForm.technologies.map(tech => (
                    <span key={tech} className="tech-tag">
                      {tech}
                      <button onClick={() => removeTechnology(tech)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                    className="form-field flex-1"
                    placeholder="Add technology (e.g., React)"
                  />
                  <button
                    onClick={addTechnology}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Project Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={projectForm.image}
                  onChange={handleProjectInput}
                  className="form-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={projectForm.github}
                    onChange={handleProjectInput}
                    className="form-field"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    name="live"
                    value={projectForm.live}
                    onChange={handleProjectInput}
                    className="form-field"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Category
                  </label>
                  <select
                    name="category"
                    value={projectForm.category}
                    onChange={handleProjectInput}
                    className="form-field"
                  >
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Completed Date
                  </label>
                  <input
                    type="date"
                    name="completedDate"
                    value={projectForm.completedDate}
                    onChange={handleProjectInput}
                    className="form-field"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Your project will be saved as pending and will not appear on the
                public Projects page until a teacher approves it first, then an
                admin gives final approval.
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveProject}
                  className="flex-1 primary-btn"
                  disabled={!projectForm.title || !projectForm.description || projectSubmitting}
                >
                  {projectSubmitting
                    ? "Submitting..."
                    : editingProject
                      ? "Update Request"
                      : "Submit Request"}
                </button>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 ghost-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="prof-root">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-1">Account</p>
              <h1 className="prof-heading text-4xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-500 mt-1">Manage your personal information, avatar, and projects</p>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="primary-btn inline-flex items-center gap-2">
                <Edit2 className="h-4 w-4" />Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleCancel} className="ghost-btn">Cancel</button>
                <button onClick={handleSave} className="primary-btn inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />Save Changes
                </button>
              </div>
            )}
          </div>

          {profileLoading && (
            <div className="mb-5 rounded-2xl bg-white border border-indigo-100 px-4 py-3 text-sm text-indigo-700">
              Loading your latest profile data...
            </div>
          )}

          {profileError && (
            <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {profileError}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}>
                  <Icon className="h-4 w-4" />{tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="prof-card overflow-hidden">
                {/* Cover */}
                <div className="h-24 relative" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)" }}>
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                </div>

                <div className="px-6 pb-6">
                  <div className="flex justify-center">
                    <div className="relative -mt-12">
                      <img 
                        src={isEditing ? editForm.avatar : user.avatar} 
                        alt={user.name}
                        className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl"
                      />
                      {!isEditing && (
                        <button 
                          onClick={handleAvatarClick}
                          className="avatar-upload-btn"
                          title="Change profile picture"
                        >
                          <Camera className="h-4 w-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-3 text-center">
                      <button
                        onClick={handleAvatarClick}
                        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        <Upload className="h-4 w-4" />
                        Change Avatar
                      </button>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF · Max 2MB</p>
                    </div>
                  )}

                  <div className="text-center mt-4 mb-5">
                    <h2 className="prof-heading text-xl font-bold text-gray-900">{user.name}</h2>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1"
                      style={{ background: "#eef2ff", color: "#4f46e5" }}>{user.displayRole}</span>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined {formatDate(user.joinDate)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 py-4" style={{ borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6" }}>
                    {[
                      { label: "Courses", value: user.coursesEnrolled || 0, color: "#6366f1" },
                      { label: "Certificates", value: user.certificates || 0, color: "#10b981" },
                      { label: "Projects", value: projects.length, color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Achievements */}
                  {user.achievements?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Achievements</p>
                      <div className="flex flex-wrap gap-1.5">
                        {user.achievements.map((ach) => (
                          <span key={ach} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" }}>
                            ✦ {ach}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {activeTab === "profile" && (
                <>
                  {/* Personal Info */}
                  <div className="prof-card p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        { icon: User, label: "Full Name", name: "name", value: user.name },
                        { icon: Mail, label: "Email", name: "email", value: user.email, type: "email" },
                        { icon: Phone, label: "Phone", name: "phone", value: user.phone },
                        { icon: MapPin, label: "Location", name: "location", value: user.location },
                        { icon: Briefcase, label: "Occupation", name: "occupation", value: user.occupation },
                        { icon: GraduationCap, label: "Education", name: "education", value: user.education },
                      ].map((field) => {
                        const Icon = field.icon;
                        return (
                          <div key={field.name}>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              <Icon className="h-3 w-3" />{field.label}
                            </label>
                            {isEditing ? (
                              <input type={field.type || "text"} name={field.name}
                                value={editForm[field.name] || ""}
                                onChange={handleInput}
                                className="form-field" />
                            ) : (
                              <p className="text-sm text-gray-800 font-medium">{field.value || "—"}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Bio</label>
                      {isEditing ? (
                        <textarea name="bio" value={editForm.bio || ""} onChange={handleInput} rows={3}
                          className="form-field resize-none" />
                      ) : (
                        <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="prof-card p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Social & Web</h3>
                    <div className="space-y-3">
                      {[
                        { icon: Globe, label: "Website", name: "website" },
                        { icon: Github, label: "GitHub", name: "github" },
                        { icon: Linkedin, label: "LinkedIn", name: "linkedin" },
                        { icon: Twitter, label: "Twitter", name: "twitter" },
                      ].map((s) => {
                        const Icon = s.icon;
                        return (
                          <div key={s.name} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: "#f3f4f6" }}>
                              <Icon className="h-4 w-4 text-gray-500" />
                            </div>
                            {isEditing ? (
                              <input type="text" name={s.name} value={editForm[s.name] || ""}
                                onChange={handleInput} placeholder={s.label} className="form-field flex-1" />
                            ) : (
                              <span className="text-sm text-gray-700 font-medium">{user[s.name] || "—"}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "projects" && (
                <>
                  {/* Projects Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">My Project Requests ({projects.length})</h3>
                    <button
                      onClick={() => handleOpenProjectModal()}
                      className="primary-btn inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Request Approval
                    </button>
                  </div>

                  {/* Projects Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className="project-card">
                        <div className="flex flex-col md:flex-row">
                          {/* Project Image */}
                          <div className="md:w-48 h-48 md:h-auto">
                            <img
                              src={project.image || makeAvatar(project.title)}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Project Details */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">{project.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                              </div>
                              <span
                                className={`px-3 py-1 text-xs font-bold rounded-full ${
                                  project.is_active
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {project.is_active
                                  ? "Approved"
                                  : project.teacher_approved
                                    ? "Waiting for admin"
                                    : "Waiting for teacher"}
                              </span>
                            </div>

                            {/* Technologies */}
                            <div className="flex flex-wrap gap-2 my-3">
                              {(project.technologies || []).map(tech => (
                                <span key={tech} className="skill-chip text-xs">
                                  <Code2 className="h-3 w-3" />
                                  {tech}
                                </span>
                              ))}
                            </div>

                            {/* Links */}
                            <div className="flex gap-4 mt-4 flex-wrap">
                              {project.github && (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                  <Github className="h-4 w-4" />
                                  GitHub
                                </a>
                              )}
                              {project.live && (
                                <a
                                  href={project.live}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Live Demo
                                </a>
                              )}
                              <span className="text-sm text-gray-400">
                                Completed: {formatDate(project.completedDate)}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                              <button
                                onClick={() => handleOpenProjectModal(project)}
                                className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {projects.length === 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <FolderGit2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-gray-700 mb-1">No project requests yet</h4>
                        <p className="text-sm text-gray-500 mb-4">Submit a project for teacher review, then admin approval</p>
                        <button
                          onClick={() => handleOpenProjectModal()}
                          className="primary-btn inline-flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Submit Your First Request
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "skills" && (
                <>
                  <div className="prof-card p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Skills & Expertise</h3>

                    {isEditing && (
                      <div className="flex gap-2 mb-4">
                        <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill..." className="form-field flex-1"
                          onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                        <button onClick={addSkill} className="primary-btn">Add</button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {(isEditing ? editForm.skills || [] : user.skills || []).map((skill) => (
                        <span key={skill} className="skill-chip">
                          {skill}
                          {isEditing && (
                            <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="prof-card p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Languages</h3>
                    <div className="space-y-3">
                      {(user.languages || []).map((lang) => (
                        <div key={lang} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#fafafa" }}>
                          <span className="text-sm font-medium text-gray-700">{lang}</span>
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background: "#ecfdf5", color: "#065f46" }}>Active</span>
                        </div>
                      ))}
                      {(user.languages || []).length === 0 && (
                        <p className="text-sm text-gray-500">No languages saved yet.</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "security" && (
                <div className="prof-card p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-5">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                      <div key={label}>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
                        <input type="password" placeholder="••••••••" className="form-field" />
                      </div>
                    ))}
                    <button className="primary-btn mt-2">Update Password</button>
                  </div>

                  <div className="mt-8 pt-6" style={{ borderTop: "1px solid #f3f4f6" }}>
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Authenticator App</p>
                        <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security</p>
                      </div>
                      <button className="ghost-btn text-sm">Enable</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
