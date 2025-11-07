import { apiUrl } from "./types";

export async function deleteCourse(id: number): Promise<string> {
  const res = await fetch(`${apiUrl}/Course/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to delete course");

  return text;
}
