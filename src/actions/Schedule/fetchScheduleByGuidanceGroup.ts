import { SessionsScheduleDTO } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchScheduleByGuidanceGroup(
  groupId: number,
  semesterId?: number
): Promise<SessionsScheduleDTO[]> {
  const apiUrl = getApiUrl();
  let url = `${apiUrl}/SessionsSchedule/ByGuidanceGroup?groupID=${groupId}`;
  if (semesterId) {
    url += `&semesterID=${semesterId}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch schedule by guidance group");
  }

  return res.json();
}
