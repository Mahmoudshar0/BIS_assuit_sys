import { Instructor, apiUrl } from "./types";

export async function fetchInstructors(): Promise<Instructor[]> {
  const res = await fetch(`${apiUrl}/Instructor`, { cache: "no-store" });

  if (!res.ok) throw new Error("Failed to fetch instructors");

  return res.json();
}
