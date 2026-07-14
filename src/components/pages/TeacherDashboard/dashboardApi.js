import { API_BASE_URL } from "../../../config/api";
import {
  getProjectMajor,
  normalizeProjectTags,
  TEACHER_APPROVED_TAG,
} from "./dashboardUtils";

const API_BASE = API_BASE_URL;

export const fetchLessons = async () => {
  const response = await fetch(`${API_BASE}/lessons`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lessons: ${response.status}`);
  }
  return response.json();
};

export const fetchVideos = async () => {
  const response = await fetch(`${API_BASE}/videos`);
  if (!response.ok) {
    throw new Error(`Failed to fetch videos: ${response.status}`);
  }
  return response.json();
};

export const createVideo = async (videoData) => {
  const response = await fetch(`${API_BASE}/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(videoData),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to create video");
  return data;
};

export const updateVideo = async (id, videoData) => {
  const response = await fetch(`${API_BASE}/videos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(videoData),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to update video");
  return data;
};

export const deleteVideo = async (id) => {
  const response = await fetch(`${API_BASE}/videos/${id}`, {
    method: "DELETE",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to delete video");
  return data;
};

export const fetchProjects = async () => {
  const response = await fetch(`${API_BASE}/projects?include_inactive=1`);
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }
  return response.json();
};

export const approveProject = async (project) => {
  const projectTags = normalizeProjectTags(project.tags);
  const major = getProjectMajor(project);
  const response = await fetch(`${API_BASE}/projects/${project.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...project,
      image: project.image || project.image_url || "",
      tags: [...new Set([...projectTags, TEACHER_APPROVED_TAG])],
      github_url: project.github_url || project.github || "",
      live_url: project.live_url || project.demo_url || "",
      major,
      student_major: major,
      teacher_approved: true,
      admin_approved: false,
      approval_status: "admin_pending",
      is_active: false,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to approve project");
  return data;
};
