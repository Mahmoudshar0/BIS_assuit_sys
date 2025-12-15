import { Student } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchStudentById(studentId: string): Promise<Student> {
  const apiUrl = getApiUrl();

  const res = await fetch(`${apiUrl}/Students/ById?studentID=${studentId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch student data");
  }

  return res.json();
}
