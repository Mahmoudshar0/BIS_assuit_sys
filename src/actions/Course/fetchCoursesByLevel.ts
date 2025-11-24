import { Course } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchCoursesByLevel(levelId: number): Promise<Course[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/Course/level/${levelId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch courses by level");
  }

  return res.json();
}
