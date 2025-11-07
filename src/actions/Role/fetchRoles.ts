import { Role, apiUrl } from "./types";

export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const res = await fetch(`${apiUrl}/Role`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch roles");

    return await res.json();
  } catch (err) {
    console.error("❌ Error:", err);
    return [];
  }
};
