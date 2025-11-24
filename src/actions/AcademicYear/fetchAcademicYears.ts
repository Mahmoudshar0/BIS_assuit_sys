import { AcademicYear } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchAcademicYears(): Promise<AcademicYear[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/AcademicYear`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch academic years");
  }

  return res.json();
}
