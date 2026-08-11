import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  BookOpen,
  Award,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Camera,
  Save,
  X,
  Edit2,
  Check,
  Shield,
  Star,
  FolderGit2,
  Plus,
  Link,
  ExternalLink,
  Code2,
  Trash2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { profileApi, syncStoredSession } from "../../api/profile";
import { API_BASE_URL } from "../../../config/api";
import ResetPasswordModal from "../../layout/auth/ResetPasswordModal";

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
      role === "client"
        ? "Student"
        : role
          ? role.charAt(0).toUpperCase() + role.slice(1)
          : "Student",
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
  const [profileSaving, setProfileSaving] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const initialUserRef = useRef(initialUser);
  const onUserUpdateRef = useRef(onUserUpdate);

  const [editForm, setEditForm] = useState({ ...user });

  useEffect(() => {
    initialUserRef.current = initialUser;
    onUserUpdateRef.current = onUserUpdate;
  }, [initialUser, onUserUpdate]);

  useEffect(() => {
    let cancelled = false;
    const sourceUser = initialUserRef.current;
    const userId = sourceUser?.id;

    if (!userId || String(userId).startsWith("user-")) {
      const normalized = normalizeProfile(sourceUser);
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
        onUserUpdateRef.current?.(normalized);
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
    completedDate: new Date().toISOString().split("T")[0],
  });
  const [techInput, setTechInput] = useState("");

  const handleInput = (e) =>
    setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (profileSaving) return;
    if (!editForm.name?.trim() || !editForm.email?.trim()) {
      setProfileError("Name and email are required.");
      return;
    }
    setProfileSaving(true);
    setProfileError("");
    try {
      const userId = user.id || initialUser?.id;
      let saved = normalizeProfile(editForm);
      if (userId && !String(userId).startsWith("user-")) {
        saved = normalizeProfile(
          await profileApi.updateProfile(userId, editForm),
        );
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
    } finally {
      setProfileSaving(false);
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
        setProfileError("Profile images must be smaller than 2 MB.");
        e.target.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        setProfileError("Please choose a valid image file.");
        e.target.value = "";
        return;
      }
      setProfileError("");
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
      fileInputRef.current.value = "";
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
        completedDate:
          project.completedDate || new Date().toISOString().split("T")[0],
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
        completedDate: new Date().toISOString().split("T")[0],
      });
    }
    setShowProjectModal(true);
  };

  const handleProjectInput = (e) => {
    setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
  };

  const addTechnology = () => {
    if (
      techInput.trim() &&
      !projectForm.technologies.includes(techInput.trim())
    ) {
      setProjectForm({
        ...projectForm,
        technologies: [...projectForm.technologies, techInput.trim()],
      });
      setTechInput("");
    }
  };

  const removeTechnology = (tech) => {
    setProjectForm({
      ...projectForm,
      technologies: projectForm.technologies.filter((t) => t !== tech),
    });
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || !projectForm.description || projectSubmitting) {
      return;
    }

    setProjectSubmitting(true);
    setProfileError("");
    const studentMajor =
      user.major || initialUser?.major || editForm.major || "";
    const majorTag = studentMajor
      ? `${PROJECT_MAJOR_PREFIX}${studentMajor}`
      : null;

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
        throw new Error(
          savedProject.error || "Could not submit project request.",
        );
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
        ? projects.map((p) =>
            p.id === editingProject.id ? requestedProject : p,
          )
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

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProfileError("");
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Could not delete project request.");
        }
        const updatedProjects = projects.filter((p) => p.id !== projectId);
        setProjects(updatedProjects);
        writeStoredProjects(projectStorageKey, updatedProjects);
        setSuccessMessage("Project deleted successfully!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        setProfileError(err.message);
      }
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        .lg-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100dvh;
          position: relative;
          isolation: isolate;
          overflow-x: hidden;
          background: 
            radial-gradient(ellipse 80% 60% at 10% 10%, rgba(99,102,241,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 90% 20%, rgba(14,165,233,0.14) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 90%, rgba(139,92,246,0.12) 0%, transparent 50%),
            linear-gradient(165deg, #f0f4ff 0%, #eef2ff 40%, #f5f3ff 100%);
          background-attachment: fixed;
          padding-top: 96px;
          padding-bottom: 64px;
        }
        
        .lg-root::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -2;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.6;
          pointer-events: none;
        }

        .lg-glass {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.65);
          box-shadow: 
            0 8px 32px rgba(99, 102, 241, 0.07),
            0 2px 8px rgba(99, 102, 241, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .lg-glass-strong {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(32px) saturate(200%);
          -webkit-backdrop-filter: blur(32px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.75);
          box-shadow: 
            0 12px 40px rgba(99, 102, 241, 0.1),
            0 4px 12px rgba(99, 102, 241, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }

        .lg-glass-dark {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .lg-input {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(99, 102, 241, 0.15);
          border-radius: 16px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #1e1b4b;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          width: 100%;
          box-shadow: inset 0 2px 4px rgba(99, 102, 241, 0.03);
        }

        .lg-input:hover {
          background: rgba(255, 255, 255, 0.75);
          border-color: rgba(99, 102, 241, 0.25);
        }

        .lg-input:focus {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 
            0 0 0 4px rgba(99, 102, 241, 0.1),
            inset 0 2px 4px rgba(99, 102, 241, 0.05);
        }

        .lg-btn-primary {
          background: var(--accent-gradient, linear-gradient(135deg, #6366f1, #8b5cf6));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 24px var(--accent-glow, rgba(99,102,241,.28));
          transition: transform 0.15s, box-shadow 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .lg-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px var(--accent-glow, rgba(99,102,241,.34));
        }
        .lg-tab-pill {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 14px;
          border: 1px solid transparent;
          border-radius: 12px;
          color: #566176;
          font-size: 14px;
          font-weight: 600;
          transition: color .2s, background .2s, border-color .2s, box-shadow .2s;
        }
        .lg-tab-pill:hover {
          color: var(--accent-color, #4f46e5);
          background: var(--accent-light, rgba(99,102,241,.10));
        }
        .lg-tab-pill.active {
          color: var(--accent-color, #4f46e5);
          background: var(--accent-light, rgba(99,102,241,.12));
          border-color: var(--accent-border, rgba(99,102,241,.22));
          box-shadow: 0 6px 16px var(--accent-glow, rgba(99,102,241,.12));
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
          padding: 6px 14px;
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

        .lg-cover-shine::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255,255,255,0.15) 50%,
            transparent 70%
          );
          animation: shine 8s infinite;
        }
        
        .ghost-btn:hover { 
          border-color: #a5b4fc; 
          color: #4f46e5; 
        }

        .lg-project-card {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 24px rgba(99, 102, 241, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .lg-project-card:hover {
          transform: translateY(-4px) scale(1.005);
          background: rgba(255, 255, 255, 0.65);
          box-shadow: 
            0 20px 50px rgba(99, 102, 241, 0.12),
            0 8px 20px rgba(99, 102, 241, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          border-color: rgba(99, 102, 241, 0.25);
        }

        .lg-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        .lg-modal {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 32px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 36px;
          box-shadow: 
            0 24px 80px rgba(99, 102, 241, 0.15),
            0 8px 24px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          animation: modalUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalUp {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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

        /* Unified iOS-style liquid glass profile experience. */
        .prof-root {
          min-height:100dvh;
          background:
            radial-gradient(circle at 8% 5%,rgba(99,102,241,.18),transparent 30rem),
            radial-gradient(circle at 94% 16%,rgba(14,165,233,.13),transparent 30rem),
            linear-gradient(145deg,#f8faff 0%,#edf3ff 58%,#faf7ff 100%) !important;
          background-attachment:fixed !important;
        }
        .prof-card,.project-card,.modal-content {
          background:rgba(255,255,255,.70) !important;
          border:1px solid rgba(255,255,255,.82) !important;
          box-shadow:0 26px 68px rgba(45,55,100,.13),inset 0 1px 0 rgba(255,255,255,.96) !important;
          backdrop-filter:blur(26px) saturate(155%);
          -webkit-backdrop-filter:blur(26px) saturate(155%);
        }
        .project-card:hover {
          transform:none;
          border-color:rgba(99,102,241,.28) !important;
          box-shadow:0 30px 76px rgba(79,70,229,.16),inset 0 1px 0 #fff !important;
        }
        .form-field {
          min-height:44px;
          color:#172033;
          background:rgba(255,255,255,.66) !important;
          border-color:rgba(100,116,160,.20) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.92);
        }
        .form-field:focus {
          background:rgba(255,255,255,.94) !important;
          border-color:#818cf8 !important;
          box-shadow:0 0 0 4px rgba(99,102,241,.13),inset 0 1px 0 #fff !important;
        }
        .tab-btn {
          min-height:42px;
          border:1px solid transparent;
          border-radius:15px;
        }
        .tab-btn.active {
          background:rgba(99,102,241,.12) !important;
          border-color:rgba(99,102,241,.14);
          color:#4338ca !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 8px 22px rgba(79,70,229,.08);
        }

        .lg-subtext {
          color: #6366f1;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 12px;
        }
        .primary-btn { min-height:44px; box-shadow:0 10px 26px rgba(79,70,229,.24),inset 0 1px 0 rgba(255,255,255,.22); }
        .primary-btn:hover { transform:none; box-shadow:0 14px 30px rgba(79,70,229,.30),inset 0 1px 0 rgba(255,255,255,.22); }
        .skill-chip,.tech-tag {
          background:rgba(224,231,255,.72) !important;
          border-color:rgba(99,102,241,.18) !important;
          color:#4338ca !important;
        }

        .lg-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 20px;
          padding-right: 40px;
        }

        /* Dark theme: keep every glass layer and label on the same palette. */
        html.dark-mode .lg-root {
          color:#eef2ff;
          background:
            radial-gradient(circle at 8% 5%,rgba(99,102,241,.23),transparent 30rem),
            radial-gradient(circle at 94% 16%,rgba(14,165,233,.13),transparent 30rem),
            linear-gradient(145deg,#070816 0%,#0c1024 58%,#0d0b1d 100%) !important;
        }
        html.dark-mode .prof-card,html.dark-mode .project-card,html.dark-mode .modal-content {
          background:rgba(16,18,42,.80) !important;
          border-color:rgba(165,180,252,.17) !important;
          box-shadow:0 30px 76px rgba(0,0,0,.40),inset 0 1px 0 rgba(255,255,255,.07) !important;
        }
        html.dark-mode .lg-glass-strong { background:rgba(20,24,52,.82); }
        html.dark-mode .lg-project-card:hover {
          background:rgba(27,33,66,.88);
          border-color:rgba(129,140,248,.32);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 22px 54px rgba(0,0,0,.34);
        }
        html.dark-mode .lg-heading {
          background:linear-gradient(135deg,#ffffff 0%,#c7d2fe 55%,#93c5fd 100%);
          -webkit-background-clip:text;
          background-clip:text;
          -webkit-text-fill-color:transparent;
        }
        html.dark-mode .tab-btn { color:#a8b1d6 !important; }
        html.dark-mode .tab-btn.active {
          color:#f4f7ff !important;
          background:rgba(99,102,241,.22) !important;
          border-color:rgba(165,180,252,.18);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.07);
        }
        html.dark-mode .lg-tab-pill { color:#aab4d1; }
        html.dark-mode .lg-tab-pill:hover,
        html.dark-mode .lg-tab-pill.active {
          color:#ffffff;
          background:var(--accent-light, rgba(99,102,241,.20));
          border-color:var(--accent-border, rgba(165,180,252,.20));
        }
        html.dark-mode .ghost-btn {
          background:rgba(7,8,22,.48) !important;
          border-color:rgba(165,180,252,.18) !important;
          color:#d7def7 !important;
        }
        html.dark-mode .skill-chip,html.dark-mode .tech-tag {
          background:rgba(99,102,241,.18) !important;
          border-color:rgba(165,180,252,.20) !important;
          color:#c7d2fe !important;
        }
        html.dark-mode .lg-input:hover { background:rgba(11,15,36,.78); border-color:rgba(165,180,252,.3); }
        html.dark-mode .lg-input:focus { background:rgba(13,17,40,.92); border-color:#818cf8; }
        html.dark-mode .lg-input::placeholder { color:#727b9d; }
        html.dark-mode .lg-btn-ghost { color:#dbe2ff; background:rgba(255,255,255,.07); border-color:rgba(165,180,252,.18); box-shadow:inset 0 1px 0 rgba(255,255,255,.06); }
        html.dark-mode .lg-btn-ghost:hover { color:#fff; background:rgba(99,102,241,.17); }
        html.dark-mode .lg-chip { color:#c7d2fe; background:rgba(99,102,241,.18); border-color:rgba(165,180,252,.2); box-shadow:inset 0 1px 0 rgba(255,255,255,.05); }
        html.dark-mode .lg-modal { background:rgba(17,21,45,.92); border-color:rgba(165,180,252,.17); box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 28px 90px rgba(0,0,0,.55); }
        html.dark-mode .lg-modal-overlay { background:rgba(2,4,13,.76); }
        html.dark-mode .lg-toast { background:rgba(17,24,45,.9); border-color:rgba(52,211,153,.3); }
        html.dark-mode .lg-divider { background:linear-gradient(90deg,transparent,rgba(165,180,252,.2),transparent); }
        html.dark-mode .lg-root .text-gray-900,
        html.dark-mode .lg-root .text-gray-800,
        html.dark-mode .lg-root .text-slate-900 { color:#f4f7ff !important; }
        html.dark-mode .lg-root .text-gray-700,
        html.dark-mode .lg-root .text-slate-700 { color:#d6ddf3 !important; }
        html.dark-mode .lg-root .text-gray-600,
        html.dark-mode .lg-root .text-gray-500,
        html.dark-mode .lg-root .text-slate-500 { color:#aab4d1 !important; }
        html.dark-mode .lg-root .text-gray-400 { color:#8792b5 !important; }

        @media (max-width: 768px) {
          .lg-root {
            padding-top: 80px;
            padding-bottom: 40px;
          }
          .lg-modal {
            margin: 0;
            border-radius: 28px 28px 0 0;
            max-height: calc(100dvh - 20px);
            padding: 28px 20px;
          }
          .lg-modal-overlay {
            align-items: flex-end;
            padding: 0;
          }
          .lg-toast {
            left: 16px;
            right: 16px;
            top: auto;
            bottom: 24px;
          }
        }
      `}</style>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      {showSuccess && (
        <div className="lg-toast" role="status" aria-live="polite">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-emerald-800">{successMessage}</p>
        </div>
      )}

      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        initialEmail={user.email}
      />

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="lg-modal-overlay" onClick={handleAvatarCancel}>
          <div
            className="lg-modal max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="lg-heading text-2xl mb-2">Update Photo</h3>
              <p className="text-sm text-indigo-400 font-medium mb-8">
                Preview your new profile picture
              </p>

              <div className="flex justify-center mb-8">
                <div className="lg-avatar-ring">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-36 h-36 rounded-[28px] object-cover ring-4 ring-white/80 shadow-2xl"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAvatarUpload}
                  className="flex-1 lg-btn-primary flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Save Photo
                </button>
                <button
                  onClick={handleAvatarCancel}
                  className="flex-1 lg-btn-ghost"
                >
                  Cancel
                </button>
              </div>

              <button
                onClick={handleAvatarClick}
                className="mt-4 text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                Choose a different image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div
          className="lg-modal-overlay"
          onClick={() => setShowProjectModal(false)}
        >
          <div className="lg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="lg-heading text-2xl">
                  {editingProject ? "Edit Project" : "New Project"}
                </h3>
                <p className="text-xs text-indigo-400 font-semibold mt-1 uppercase tracking-wider">
                  {editingProject
                    ? "Update your request"
                    : "Submit for approval"}
                </p>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                className="w-10 h-10 rounded-2xl bg-white/60 hover:bg-white/90 flex items-center justify-center transition-all border border-indigo-100"
              >
                <X className="h-5 w-5 text-indigo-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="lg-subtext mb-2 block">Project Title *</label>
                <input
                  type="text"
                  name="title"
                  value={projectForm.title}
                  onChange={handleProjectInput}
                  className="lg-input"
                  placeholder="e.g., Arduino Weather Station"
                />
              </div>

              <div>
                <label className="lg-subtext mb-2 block">Description *</label>
                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectInput}
                  rows={3}
                  className="lg-input resize-none"
                  placeholder="Describe your project..."
                />
              </div>

              <div>
                <label className="lg-subtext mb-2 block">Technologies</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {projectForm.technologies.map((tech) => (
                    <span key={tech} className="lg-chip">
                      {tech}
                      <button
                        onClick={() => removeTechnology(tech)}
                        className="hover:text-red-500 transition-colors"
                      >
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
                    onKeyPress={(e) => e.key === "Enter" && addTechnology()}
                    className="lg-input flex-1"
                    placeholder="Add technology..."
                  />
                  <button
                    onClick={addTechnology}
                    className="lg-btn-primary px-5"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="lg-subtext mb-2 block">
                  Project Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={projectForm.image}
                  onChange={handleProjectInput}
                  className="lg-input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="lg-subtext mb-2 block">GitHub URL</label>
                  <input
                    type="url"
                    name="github"
                    value={projectForm.github}
                    onChange={handleProjectInput}
                    className="lg-input"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="lg-subtext mb-2 block">Live Demo URL</label>
                  <input
                    type="url"
                    name="live"
                    value={projectForm.live}
                    onChange={handleProjectInput}
                    className="lg-input"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="lg-subtext mb-2 block">Category</label>
                  <select
                    name="category"
                    value={projectForm.category}
                    onChange={handleProjectInput}
                    className="lg-input lg-select"
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
                  <label className="lg-subtext mb-2 block">
                    Completed Date
                  </label>
                  <input
                    type="date"
                    name="completedDate"
                    value={projectForm.completedDate}
                    onChange={handleProjectInput}
                    className="lg-input"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 backdrop-blur-sm px-5 py-4 text-sm text-amber-800 font-medium">
                <span className="flex items-start gap-2">
                  <span className="text-amber-500 text-lg leading-none">
                    ⚡
                  </span>
                  Your project will be saved as pending and will not appear on
                  the public Projects page until a teacher approves it first,
                  then an admin gives final approval.
                </span>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSaveProject}
                  className="flex-1 lg-btn-primary"
                  disabled={
                    !projectForm.title ||
                    !projectForm.description ||
                    projectSubmitting
                  }
                >
                  {projectSubmitting
                    ? "Submitting..."
                    : editingProject
                      ? "Update Request"
                      : "Submit Request"}
                </button>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 lg-btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg-root">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="lg-subtext mb-3">Account Settings</p>
              <h1 className="lg-heading text-5xl sm:text-6xl">My Profile</h1>
              <p className="mt-2 font-medium" style={{ color: "var(--accent-color)" }}>
                Manage your personal information, avatar, and projects
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="lg-btn-primary inline-flex items-center gap-2 self-start"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3 self-start">
                <button onClick={handleCancel} className="lg-btn-ghost">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={profileSaving}
                  className="lg-btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {profileLoading && (
            <div className="mb-6 rounded-2xl lg-glass px-5 py-4 text-sm text-indigo-700 font-semibold flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Loading your latest profile data...
            </div>
          )}

          {profileError && (
            <div
              className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-red-50/80 backdrop-blur-sm border border-red-200/60 px-5 py-4 text-sm text-red-700 font-semibold"
              role="alert"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {profileError}
              </span>
              <button
                type="button"
                onClick={() => setProfileError("")}
                className="rounded-xl p-2 hover:bg-red-100 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="lg-glass-strong rounded-2xl p-1.5 w-fit mb-8 flex gap-1 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`lg-tab-pill ${activeTab === tab.id ? "active" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="lg-glass-strong rounded-[32px] overflow-hidden sticky top-24">
                {/* Cover */}
                <div className="h-24 relative" style={{ background: "var(--accent-gradient, linear-gradient(135deg, #6366f1, #8b5cf6))" }}>
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                </div>

                <div className="px-6 pb-8">
                  <div className="flex justify-center">
                    <div className="relative -mt-14">
                      <div className="lg-avatar-ring">
                        <img
                          src={isEditing ? editForm.avatar : user.avatar}
                          alt={user.name}
                          className="w-28 h-28 rounded-[28px] object-cover ring-[6px] ring-white/90 shadow-2xl"
                        />
                      </div>
                      {!isEditing && (
                        <button
                          onClick={handleAvatarClick}
                          className="lg-avatar-btn"
                          title="Change profile picture"
                        >
                          <Camera className="h-4 w-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleAvatarClick}
                        className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Change Avatar
                      </button>
                      <p className="text-xs text-indigo-400/70 mt-1 font-medium">
                        JPG, PNG or GIF · Max 2MB
                      </p>
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
                  <div className="grid grid-cols-3 gap-3 py-5 px-2 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                    {[
                      { label: "Courses", value: user.coursesEnrolled || 0, color: "#6366f1" },
                      { label: "Certificates", value: user.certificates || 0, color: "#10b981" },
                      { label: "Projects", value: projects.length, color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-2xl font-extrabold" style={{ color: s.color }}>
                          {s.value}
                        </p>
                        <p className="text-[11px] font-bold text-indigo-400/60 uppercase tracking-wider mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Achievements */}
                  {user.achievements?.length > 0 && (
                    <div className="mt-6">
                      <p className="lg-subtext mb-3">Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {user.achievements.map((ach) => (
                          <span
                            key={ach}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50/80 text-amber-700 border border-amber-200/60 backdrop-blur-sm"
                          >
                            <Award className="h-3 w-3" />
                            {ach}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === "profile" && (
                <>
                  {/* Personal Info */}
                  <div className="lg-glass rounded-[28px] p-7">
                    <h3 className="lg-heading text-xl mb-6">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        {
                          icon: User,
                          label: "Full Name",
                          name: "name",
                          value: user.name,
                        },
                        {
                          icon: Mail,
                          label: "Email",
                          name: "email",
                          value: user.email,
                          type: "email",
                        },
                        {
                          icon: Phone,
                          label: "Phone",
                          name: "phone",
                          value: user.phone,
                        },
                        {
                          icon: MapPin,
                          label: "Location",
                          name: "location",
                          value: user.location,
                        },
                        {
                          icon: Briefcase,
                          label: "Occupation",
                          name: "occupation",
                          value: user.occupation,
                        },
                        {
                          icon: GraduationCap,
                          label: "Education",
                          name: "education",
                          value: user.education,
                        },
                      ].map((field) => {
                        const Icon = field.icon;
                        return (
                          <div key={field.name}>
                            <label className="flex items-center gap-2 text-xs font-bold text-indigo-400/70 uppercase tracking-wider mb-2">
                              <Icon className="h-3.5 w-3.5" />
                              {field.label}
                            </label>
                            {isEditing ? (
                              <input
                                type={field.type || "text"}
                                name={field.name}
                                value={editForm[field.name] || ""}
                                onChange={handleInput}
                                className="lg-input"
                              />
                            ) : (
                              <p className="text-sm text-slate-800 font-semibold">
                                {field.value || "—"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6">
                      <label className="lg-subtext mb-2 block">Bio</label>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={editForm.bio || ""}
                          onChange={handleInput}
                          rows={3}
                          className="lg-input resize-none"
                        />
                      ) : (
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                          {user.bio || (
                            <span className="text-slate-400 italic">
                              No bio added yet.
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="lg-glass rounded-[28px] p-7">
                    <h3 className="lg-heading text-xl mb-6">Social & Web</h3>
                    <div className="space-y-4">
                      {[
                        { icon: Globe, label: "Website", name: "website" },
                        { icon: Github, label: "GitHub", name: "github" },
                        { icon: Linkedin, label: "LinkedIn", name: "linkedin" },
                        { icon: Twitter, label: "Twitter", name: "twitter" },
                      ].map((s) => {
                        const Icon = s.icon;
                        return (
                          <div
                            key={s.name}
                            className="flex items-center gap-4 p-3 rounded-2xl bg-white/30 hover:bg-white/50 transition-colors border border-transparent hover:border-white/60"
                          >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50/80 text-indigo-600">
                              <Icon className="h-5 w-5" />
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                name={s.name}
                                value={editForm[s.name] || ""}
                                onChange={handleInput}
                                placeholder={s.label}
                                className="lg-input flex-1"
                              />
                            ) : user[s.name] ? (
                              <a
                                href={user[s.name]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                              >
                                {user[s.name]}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-sm text-slate-400 font-medium">
                                Not connected
                              </span>
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="lg-heading text-2xl">My Projects</h3>
                      <p className="text-sm text-indigo-400/70 font-medium mt-1">
                        {projects.length} request
                        {projects.length !== 1 ? "s" : ""} submitted
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenProjectModal()}
                      className="lg-btn-primary inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      New Request
                    </button>
                  </div>

                  {/* Projects Grid */}
                  <div className="grid grid-cols-1 gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className="lg-project-card">
                        <div className="flex flex-col md:flex-row">
                          {/* Project Image */}
                          <div className="md:w-52 h-52 md:h-auto relative overflow-hidden">
                            <img
                              src={project.image || makeAvatar(project.title)}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>

                          {/* Project Details */}
                          <div className="flex-1 p-7">
                            <div className="flex items-start justify-between mb-3 gap-4">
                              <div>
                                <h4 className="lg-heading text-lg">
                                  {project.title}
                                </h4>
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                  {project.description}
                                </p>
                              </div>
                              <span
                                className={`lg-status-badge flex-shrink-0 ${
                                  project.is_active
                                    ? "lg-status-approved"
                                    : project.teacher_approved
                                      ? "lg-status-waiting"
                                      : "lg-status-pending"
                                }`}
                              >
                                {project.is_active
                                  ? "Approved"
                                  : project.teacher_approved
                                    ? "Admin Review"
                                    : "Pending"}
                              </span>
                            </div>

                            {/* Technologies */}
                            <div className="flex flex-wrap gap-2 my-4">
                              {(project.technologies || []).map((tech) => (
                                <span key={tech} className="lg-chip text-xs">
                                  <Code2 className="h-3 w-3" />
                                  {tech}
                                </span>
                              ))}
                            </div>

                            {/* Links */}
                            <div className="flex gap-5 mt-5 flex-wrap items-center">
                              {project.github && (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
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
                                  className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Live Demo
                                </a>
                              )}
                              <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(project.completedDate)}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 pt-5 lg-divider">
                              <button
                                onClick={() => handleOpenProjectModal(project)}
                                className="px-5 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50/80 rounded-xl transition-all border border-transparent hover:border-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {projects.length === 0 && (
                      <div className="text-center py-16 lg-empty-state">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                          <FolderGit2 className="h-8 w-8 text-indigo-300" />
                        </div>
                        <h4 className="lg-heading text-lg mb-2">
                          No projects yet
                        </h4>
                        <p className="text-sm text-slate-500 font-medium mb-6 max-w-sm mx-auto">
                          Submit a project for teacher review, then admin
                          approval
                        </p>
                        <button
                          onClick={() => handleOpenProjectModal()}
                          className="lg-btn-primary inline-flex items-center gap-2"
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
                  <div className="lg-glass rounded-[28px] p-7">
                    <h3 className="lg-heading text-xl mb-6">
                      Skills & Expertise
                    </h3>

                    {isEditing && (
                      <div className="flex gap-3 mb-6">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill..."
                          className="lg-input flex-1"
                          onKeyDown={(e) => e.key === "Enter" && addSkill()}
                        />
                        <button
                          onClick={addSkill}
                          className="lg-btn-primary px-6"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2.5">
                      {(isEditing
                        ? editForm.skills || []
                        : user.skills || []
                      ).map((skill) => (
                        <span key={skill} className="lg-chip text-sm py-2 px-4">
                          {skill}
                          {isEditing && (
                            <button
                              onClick={() => removeSkill(skill)}
                              className="hover:text-red-500 transition-colors ml-1"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </span>
                      ))}
                      {(isEditing ? editForm.skills || [] : user.skills || [])
                        .length === 0 && (
                        <p className="text-sm text-slate-400 italic">
                          No skills added yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg-glass rounded-[28px] p-7">
                    <h3 className="lg-heading text-xl mb-6">Languages</h3>
                    <div className="space-y-3">
                      {(user.languages || []).map((lang) => (
                        <div
                          key={lang}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-sm"
                        >
                          <span className="text-sm font-bold text-slate-700">
                            {lang}
                          </span>
                          <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-emerald-50/80 text-emerald-700 border border-emerald-200/60">
                            Active
                          </span>
                        </div>
                      ))}
                      {(user.languages || []).length === 0 && (
                        <p className="text-sm text-slate-400 italic">
                          No languages saved yet.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === "security" && (
                <div className="lg-glass rounded-[28px] p-7">
                  <div className="max-w-lg">
                    <h3 className="lg-heading text-xl mb-3">
                      Password & Security
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Reset your password using the verified email address
                      associated with this account.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="lg-btn-primary mt-6"
                    >
                      Reset Password
                    </button>
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
