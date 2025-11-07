import { toast } from "sonner";
import { GuidanceGroupPayload, apiUrl } from "./types";

export const addGuidanceGroup = async (payload: GuidanceGroupPayload) => {
  try {
    const res = await fetch(`${apiUrl}/GuidanceGroup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to add group");

    toast.success("تم إضافة المجموعة بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error adding group:", err);
    toast.error("فشل الإضافة.");
    return false;
  }
};
