import { toast } from "sonner";
import { AcademicYearPayload, apiUrl } from "./types";

export const addAcademicYear = async (payload: AcademicYearPayload) => {
  try {
    const res = await fetch(`${apiUrl}/AcademicYear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to add academic year");

    toast.success("تم إضافة السنة الأكاديمية بنجاح.");
    return true;
  } catch (err) {
    console.error("❌ Error adding:", err);
    toast.error("فشل الإضافة.");
    return false;
  }
};
