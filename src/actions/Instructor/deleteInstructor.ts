import { apiUrl } from "./types";

export async function deleteInstructor(id: number): Promise<string> {
  const res = await fetch(`${apiUrl}/Instructor/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to delete instructor");

  return text;
}
