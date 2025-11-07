import { toast } from "sonner";
import { AcademicYear, apiUrl } from "./types";

export const fetchAcademicYears = async (): Promise<AcademicYear[]> => {
  try {
    const res = await fetch(`${apiUrl}/AcademicYear`);
    if (!res.ok) throw new Error("Failed to fetch academic years");

    const data: AcademicYear[] = await res.json();

    return data.map((year) => ({
      ...year,
      label: `${new Date(year.startDate).getFullYear()} - ${new Date(
        year.endDate
      ).getFullYear()}`,
    }));
  } catch (err) {
    console.error("❌ Error fetching:", err);
    toast.error("حدث خطأ أثناء جلب السنوات الأكاديمية.");
    return [];
  }
};
