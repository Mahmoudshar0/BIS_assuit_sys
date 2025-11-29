import { getAuthHeaders, getApiUrl } from "@/lib/api";
import { Student } from "./types";

export async function fetchStudentsByGroupId(groupId: number): Promise<Student[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/Students/BySessionGroup?sessionGroupID=${groupId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch students");
  }

  return res.json();
}
