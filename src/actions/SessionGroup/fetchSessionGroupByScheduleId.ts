import { getAuthHeaders, getApiUrl } from "@/lib/api";
import { SessionGroupDTO } from "./types";

export async function fetchSessionGroupByScheduleId(scheduleId: number): Promise<SessionGroupDTO> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/SessionGroup/BySessionScheduleID/?sessionScheduleID=${scheduleId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch session group");
  }
  return res.json();
}
