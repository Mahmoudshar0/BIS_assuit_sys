export interface Semester {
  id: number;
  enSemesterNumber: number;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  academicYearId: number;
  academicYearLabel: string;
}

export type SemesterPayload = Omit<Semester, "id" | "academicYearLabel"> & {
  id?: number;
};
