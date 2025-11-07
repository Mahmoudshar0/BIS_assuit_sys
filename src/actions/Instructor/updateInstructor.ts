import { InstructorPayload, apiUrl } from "./types";

export async function updateInstructor(
  id: number,
  payload: InstructorPayload
): Promise<string> {
  const res = await fetch(`${apiUrl}/Instructor/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to update instructor");

  return text;
}
