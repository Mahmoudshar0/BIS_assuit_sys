import { toast } from "sonner";
import { apiUrl } from "./types";

export const deleteGuidanceGroup = async (id: number) => {
  try {
    const res = await fetch(`${apiUrl}/GuidanceGroup/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete group");

    toast.success("تم حذف المجموعة بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error deleting group:", err);
    toast.error("فشل الحذف.");
    return false;
  }
};
