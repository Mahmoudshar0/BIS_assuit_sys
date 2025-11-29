import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchCourseLevel(courseId: number): Promise<number> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/Course/CourseLevel/${courseId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch course level");
  }

  return res.json();
}
