import { StudentPayload } from "./types";
import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function updateStudent(payload: StudentPayload): Promise<void> {
  const apiUrl = getApiUrl();

  const res = await fetch(`${apiUrl}/api/Students`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to update student");
  }

  // PUT returns 204 No Content, so no JSON to parse
  if (res.status !== 204) {
    throw new Error(`Unexpected status code: ${res.status}`);
  }
}
