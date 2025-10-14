"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

interface Semester {
  id: number;
  enSemesterNumber: number;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  academicYearId: number;
  academicYearLabel: string;
}

type SemesterPayload = Omit<Semester, "id" | "academicYearLabel"> & {
  id?: number;
};

export default function SemesterSection() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  const [enSemesterNumber, setEnSemesterNumber] = useState<number>(1);
  const [semesterNumber, setSemesterNumber] = useState<number>(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [academicYearId, setAcademicYearId] = useState<number>(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [academicYears, setAcademicYears] = useState<
    { id: number; academicYearLabel: string }[]
  >([]);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await fetch(`${apiUrl}/AcademicYear`);
        if (!res.ok) throw new Error("Failed to fetch academic years");
        const data = await res.json();
        setAcademicYears(data);
      } catch (err) {
        console.error("❌ Error fetching academic years:", err);
        toast.error("فشل في جلب السنوات الأكاديمية.");
      }
    };

    fetchAcademicYears();
  }, [apiUrl]);

  const fetchSemesters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/Semester`);
      if (!res.ok) throw new Error("Failed to fetch semesters");
      const data: Semester[] = await res.json();
      setSemesters(data);
    } catch (err) {
      console.error("❌ Error fetching semesters:", err);
      toast.error("حدث خطأ أثناء جلب الفصول الدراسية.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const handleSave = async () => {
    if (!startDate || !endDate || academicYearId <= 0 || !semesterNumber) {
      toast.error("الرجاء تعبئة جميع الحقول بشكل صحيح.");
      return;
    }

    try {
      setLoading(true);
      const isEdit = Boolean(editingSemester);
      const url = isEdit
        ? `${apiUrl}/Semester/${editingSemester!.id}`
        : `${apiUrl}/Semester`;
      const method = isEdit ? "PUT" : "POST";

      const payload: SemesterPayload = {
        enSemesterNumber,
        semesterNumber,
        startDate,
        endDate,
        academicYearId,
      };

      if (isEdit) payload.id = editingSemester!.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const textResponse = await res.text();
      if (!res.ok) throw new Error(textResponse || "فشل العملية.");

      toast.success(
        textResponse ||
          (isEdit
            ? "تم تحديث الفصل الدراسي بنجاح."
            : "تم إضافة الفصل الدراسي بنجاح.")
      );

      await fetchSemesters();
      handleClose();
    } catch (err) {
      console.error("❌ Error saving semester:", err);
      toast.error(`فشل ${editingSemester ? "التعديل" : "الإضافة"}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester);
    setEnSemesterNumber(semester.enSemesterNumber);
    setSemesterNumber(semester.semesterNumber);
    setStartDate(semester.startDate.split("T")[0]);
    setEndDate(semester.endDate.split("T")[0]);
    setAcademicYearId(semester.academicYearId);
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الفصل الدراسي؟")) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/Semester/${id}`, { method: "DELETE" });
      const textResponse = await res.text();
      if (!res.ok) throw new Error(textResponse || "فشل الحذف.");

      toast.success(textResponse || "تم حذف الفصل الدراسي بنجاح.");
      await fetchSemesters();
    } catch (err) {
      console.error("❌ Error deleting semester:", err);
      toast.error("فشل الحذف.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingSemester(null);
    setEnSemesterNumber(1);
    setSemesterNumber(1);
    setStartDate("");
    setEndDate("");
    setAcademicYearId(0);
  };

  return (
    <div
      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          إدارة الفصول الدراسية
        </h2>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          disabled={loading}
        >
          <Plus size={20} />
          إضافة فصل دراسي
        </button>
      </div>

      {loading && semesters.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="mr-3 text-lg text-gray-600 dark:text-gray-300">
            جاري تحميل البيانات...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-right text-white bg-emerald-600">
                <th className="p-3 font-semibold text-center w-1/12">#</th>
                <th className="p-3 font-semibold w-2/12">الفصل</th>
                <th className="p-3 font-semibold w-3/12">تاريخ البداية</th>
                <th className="p-3 font-semibold w-3/12">تاريخ النهاية</th>
                <th className="p-3 font-semibold w-3/12">السنة الأكاديمية</th>
                <th className="p-3 font-semibold text-center w-2/12">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {semesters.length > 0 ? (
                semesters.map((sem, index) => (
                  <tr
                    key={sem.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                      {sem.semesterNumber === 1
                        ? "الفصل الدراسي الأول"
                        : sem.semesterNumber === 2
                        ? "الفصل الدراسي الثاني"
                        : "الفصل الصيفي"}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {new Date(sem.startDate).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {new Date(sem.endDate).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {sem.academicYearLabel}
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(sem)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <Edit size={16} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(sem.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <Trash size={16} /> حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-3 text-center text-gray-500 dark:text-gray-400"
                  >
                    {loading ? "جاري التحميل..." : "لا توجد فصول دراسية حالياً"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDialog && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800 dark:text-white">
              {editingSemester ? "تعديل الفصل الدراسي" : "إضافة فصل دراسي جديد"}
            </h3>

            <div className="space-y-4">
              {/* 📘 اختيار الفصل الدراسي */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  الفصل الدراسي
                </label>
                <select
                  value={semesterNumber}
                  onChange={(e) => {
                    const selected = Number(e.target.value);
                    setSemesterNumber(selected);
                    setEnSemesterNumber(selected); // تحديث الإنجليزي تلقائي
                  }}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value={1}>الفصل الدراسي الأول</option>
                  <option value={2}>الفصل الدراسي الثاني</option>
                  <option value={3}>الفصل الدراسي الصيفي</option>
                </select>
              </div>

              {/* 📅 تاريخ البداية */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* 📅 تاريخ النهاية */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  تاريخ النهاية
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* 🎓 السنة الأكاديمية */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  السنة الأكاديمية
                </label>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                >
                  <option value={0}>اختر السنة الأكاديمية</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.academicYearLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                  loading
                    ? "bg-emerald-600 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-md"
                }`}
              >
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {editingSemester ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
