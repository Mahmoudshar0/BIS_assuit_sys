import { SemesterPayload } from "./types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function addSemester(payload: SemesterPayload): Promise<string> {
  const res = await fetch(`${apiUrl}/Semester`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.text();
  if (!res.ok) throw new Error(result || "Failed to add semester");

  return result;
}
