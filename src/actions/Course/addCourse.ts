import { CoursePayload, apiUrl } from "./types";

export async function addCourse(payload: CoursePayload): Promise<string> {
  const res = await fetch(`${apiUrl}/Course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to add course");

  return text;
}
