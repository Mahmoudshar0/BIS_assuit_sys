import { CoursePayload, apiUrl } from "./types";

export async function updateCourse(
  id: number,
  payload: CoursePayload
): Promise<string> {
  const res = await fetch(`${apiUrl}/Course/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to update course");

  return text;
}
