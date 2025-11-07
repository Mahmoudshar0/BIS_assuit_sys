import { RolePayload, apiUrl } from "./types";

export const addRole = async (payload: RolePayload): Promise<string> => {
  const res = await fetch(`${apiUrl}/Role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to add role");

  return text;
};
