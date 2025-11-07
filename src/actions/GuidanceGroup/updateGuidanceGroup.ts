import { toast } from "sonner";
import { GuidanceGroupPayload, apiUrl } from "./types";

export const updateGuidanceGroup = async (payload: GuidanceGroupPayload) => {
  try {
    const res = await fetch(`${apiUrl}/GuidanceGroup/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update group");

    toast.success("تم تحديث المجموعة بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error updating group:", err);
    toast.error("فشل التحديث.");
    return false;
  }
};
