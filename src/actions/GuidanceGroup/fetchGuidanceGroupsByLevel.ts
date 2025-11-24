import { GuidanceGroup } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchGuidanceGroupsByLevel(levelId: number): Promise<GuidanceGroup[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/GuidanceGroup/level/${levelId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch guidance groups by level");
  }

  return res.json();
}
