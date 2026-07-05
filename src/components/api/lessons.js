import { API_BASE_URL } from "../../config/api";

const BASE_URL = API_BASE_URL;

export async function getLessons() {
  const res = await fetch(`${BASE_URL}/lessons`);
  return res.json();
}

export async function getLessonsBySemester(semesterId) {
  const res = await fetch(`${BASE_URL}/lessons/${semesterId}`);
  return res.json();
}
