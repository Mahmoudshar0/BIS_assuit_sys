import { RolePayload, apiUrl } from "./types";

export const updateRole = async (
  id: number,
  payload: RolePayload
): Promise<string> => {
  const res = await fetch(`${apiUrl}/Role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...payload }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to update role");

  return text;
};
