import { Student } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchStudents(): Promise<Student[]> {
  const apiUrl = getApiUrl();

  const res = await fetch(`${apiUrl}/api/Students/All`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch students");
  }

  return res.json();
}
