import { StudentPayload, apiUrl } from "./types";

export async function addStudent(payload: StudentPayload): Promise<string> {
  const res = await fetch(`${apiUrl}/Students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to add student");

  return text;
}