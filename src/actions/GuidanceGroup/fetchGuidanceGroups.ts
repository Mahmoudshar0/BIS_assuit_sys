import { toast } from "sonner";
import { GuidanceGroup, apiUrl } from "./types";

export const fetchGuidanceGroups = async (): Promise<GuidanceGroup[]> => {
  try {
    const res = await fetch(`${apiUrl}/GuidanceGroup`);
    if (!res.ok) throw new Error("Failed to fetch groups");

    return await res.json();
  } catch (err) {
    console.error("❌ Error fetching groups:", err);
    toast.error("حدث خطأ أثناء جلب المجموعات.");
    return [];
  }
};
