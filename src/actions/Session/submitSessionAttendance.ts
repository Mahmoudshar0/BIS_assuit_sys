import { getAuthHeaders, getApiUrl } from "@/lib/api";
import { CreateSessionDTO } from "./types";

export async function submitSessionAttendance(data: CreateSessionDTO): Promise<void> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/Session`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to submit attendance");
  }
}
