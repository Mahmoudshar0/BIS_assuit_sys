import { toast } from "sonner";
import { apiUrl } from "./types";

export const deleteAcademicYear = async (id: number) => {
  try {
    const res = await fetch(`${apiUrl}/AcademicYear/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete academic year");

    toast.success("تم حذف السنة الأكاديمية بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error deleting:", err);
    toast.error("فشل الحذف.");
    return false;
  }
};
