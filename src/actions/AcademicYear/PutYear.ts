import { toast } from "sonner";
import { AcademicYearPayload, apiUrl } from "./types";

export const updateAcademicYear = async (payload: AcademicYearPayload) => {
  try {
    const res = await fetch(`${apiUrl}/AcademicYear/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update academic year");

    toast.success("تم تحديث السنة الأكاديمية بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error updating:", err);
    toast.error("فشل التحديث.");
    return false;
  }
};
