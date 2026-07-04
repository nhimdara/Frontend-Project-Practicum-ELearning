const BASE_URL = 'http://localhost:5001/api';

export async function getLessons() {
  const res = await fetch(`${BASE_URL}/lessons`);
  return res.json();
}

export async function getLessonsBySemester(semesterId) {
  const res = await fetch(`${BASE_URL}/lessons/${semesterId}`);
  return res.json();
}