import {
  SessionsScheduleDTO,
  CreateSessionsScheduleDTO,
  UpdateSessionsScheduleDTO,
} from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function fetchSchedule(): Promise<SessionsScheduleDTO[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/SessionsSchedule/All`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch schedule");
  }

  return res.json();
}

export async function createSession(
  data: CreateSessionsScheduleDTO
): Promise<SessionsScheduleDTO> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/SessionsSchedule`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create session");
  }

  return res.json();
}

export async function updateSession(
  data: UpdateSessionsScheduleDTO
): Promise<void> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/SessionsSchedule`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to update session");
  }
}

export async function deleteSession(sessionId: number): Promise<void> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/SessionsSchedule?sessionID=${sessionId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to delete session");
  }
}
