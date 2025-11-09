import { StudentInput, apiUrl } from "./types";

export async function fetchStudents(): Promise<StudentInput[]> {
  const res = await fetch(`${apiUrl}/Students/All`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch students");

  return res.json();
}
