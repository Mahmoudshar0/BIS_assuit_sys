import { Semester } from "./types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function fetchSemesters(): Promise<Semester[]> {
  const res = await fetch(`${apiUrl}/Semester`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch semesters");

  return res.json();
}
