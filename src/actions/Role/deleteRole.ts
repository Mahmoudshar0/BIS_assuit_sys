import { apiUrl } from "./types";

export const deleteRole = async (id: number): Promise<string> => {
  const res = await fetch(`${apiUrl}/Role/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to delete role");

  return text;
};
