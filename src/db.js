const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export async function getCollegeById(collegeCode) {
  try {
    const res = await fetch(`${API_BASE}/colleges/${encodeURIComponent(collegeCode)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to fetch college:', err);
    return null;
  }
}

export async function getAllColleges() {
  try {
    const res = await fetch(`${API_BASE}/colleges`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to fetch colleges:', err);
    return [];
  }
}
