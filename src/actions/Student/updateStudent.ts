import { StudentPayload, apiUrl } from "./types";

export async function updateStudent(id: number, payload: StudentPayload) {
  const res = await fetch(`${apiUrl}/Students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to update student");
  }

  return await res.json();
}
