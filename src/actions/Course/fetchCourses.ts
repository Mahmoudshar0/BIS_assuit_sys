import { Course, apiUrl } from "./types";

export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${apiUrl}/Course`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch courses");

  return res.json();
}
