import { useEffect, useState } from 'react';
import type { Course } from '../data/courses';

const REFRESH_MS = 5000;

// Каталог берётся из базы знаний (rag/) и обновляется сам, когда там меняются файлы.
export function useCourses() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    let last = '';
    const load = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error();
        const text = await res.text();
        if (!alive) return;
        if (text !== last) {
          last = text;
          setCourses(JSON.parse(text));
        }
        setError(false);
      } catch {
        if (alive) setError(true);
      }
    };
    void load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return { courses, error };
}
