import { InstructorPayload, apiUrl } from "./types";

export async function addInstructor(
  payload: InstructorPayload
): Promise<string> {
  const res = await fetch(`${apiUrl}/Instructor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to add instructor");

  return text;
}
