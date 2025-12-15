import { Notification } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchNotificationsByUser(userId: string): Promise<Notification[]> {
  const apiUrl = getApiUrl();

  const res = await fetch(`${apiUrl}/Notification/user/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch notifications");
  }

  return res.json();
}
