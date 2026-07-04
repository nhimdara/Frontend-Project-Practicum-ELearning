import { useEffect, useState } from 'react';
import { getLessons } from '../api/lessons';

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessons()
      .then(data => setLessons(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {lessons.map(lesson => (
        <div key={lesson.id}>
          <h2>{lesson.title}</h2>
          <p>{lesson.description}</p>
        </div>
      ))}
    </div>
  );
}