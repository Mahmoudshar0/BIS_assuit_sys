import { SemesterPayload } from "./types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function updateSemester(
  id: number,
  payload: SemesterPayload
): Promise<string> {
  const res = await fetch(`${apiUrl}/Semester/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await res.text();
  if (!res.ok) throw new Error(result || "Failed to update semester");

  return result;
}
