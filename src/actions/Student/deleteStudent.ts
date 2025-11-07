import { apiUrl } from "./types";

export async function deleteStudent(id: number): Promise<string> {
  // TODO: Confirm DELETE endpoint structure
  const res = await fetch(`${apiUrl}/Students/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to delete student");

  return text;
}
