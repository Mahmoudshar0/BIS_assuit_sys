import { getAuthHeaders, getApiUrl } from "@/lib/api";

export async function deleteStudent(studentID: number): Promise<void> {
  const apiUrl = getApiUrl();

  const res = await fetch(`${apiUrl}/Students?studentID=${studentID}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to delete student");
  }

  // DELETE returns 204 No Content
  if (res.status !== 204) {
    throw new Error(`Unexpected status code: ${res.status}`);
  }
}
