export interface AcademicYear {
  id: number;
  startDate: string;
  endDate: string;
  label?: string;
}

export type AcademicYearPayload = Omit<AcademicYear, "id" | "label"> & {
  id?: number;
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;
