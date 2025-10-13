"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

interface AcademicYear {
  id: number;
  startDate: string;
  endDate: string;
  label?: string;
}

export default function AcademicYearSection() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchYears = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/AcademicYear`);
      if (!res.ok) throw new Error("Failed to fetch academic years");
      const data: AcademicYear[] = await res.json();
      const labeledData = data.map((year) => ({
        ...year,
        label: `${new Date(year.startDate).getFullYear()} - ${new Date(
          year.endDate
        ).getFullYear()}`,
      }));
      setYears(labeledData);
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error("حدث خطأ أثناء جلب السنوات الأكاديمية.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  const handleSave = async () => {
    if (!startDate || !endDate) {
      toast.error("الرجاء تحديد تاريخي البداية والنهاية.");
      return;
    }

    try {
      setLoading(true);
      const isEdit = Boolean(editingYear);
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `${apiUrl}/AcademicYear/${editingYear!.id}`
        : `${apiUrl}/AcademicYear`;

      const payload: any = {
        startDate,
        endDate,
      };

      // ✅ نضيف الـ id بس في حالة التعديل
      if (isEdit) payload.id = editingYear!.id;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok)
        throw new Error(`Failed to ${isEdit ? "update" : "add"} academic year`);

      await fetchYears();
      setShowDialog(false);
      setEditingYear(null);
      setStartDate("");
      setEndDate("");

      toast.success(
        isEdit
          ? "تم تحديث السنة الأكاديمية بنجاح."
          : "تم إضافة السنة الأكاديمية بنجاح."
      );
    } catch (err) {
      console.error("❌ Error saving year:", err);
      toast.error(`فشل ${editingYear ? "التعديل" : "الإضافة"}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setStartDate(year.startDate.split("T")[0]);
    setEndDate(year.endDate.split("T")[0]);
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه السنة الأكاديمية؟")) return;

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/AcademicYear/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete academic year");

      await fetchYears();
      toast.success("تم حذف السنة الأكاديمية بنجاح.");
    } catch (err) {
      console.error("❌ Error deleting year:", err);
      toast.error("فشل الحذف.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          إدارة السنوات الأكاديمية
        </h2>
        <button
          onClick={() => {
            setEditingYear(null);
            setStartDate("");
            setEndDate("");
            setShowDialog(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-70 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          disabled={loading}
        >
          <Plus size={20} />
          إضافة سنة أكاديمية
        </button>
      </div>

      {loading && years.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="mr-3 text-lg text-gray-600 dark:text-gray-300">
            جاري تحميل البيانات...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-right text-white bg-emerald-600">
                <th className="p-3 font-semibold text-center w-1/12">الرقم</th>
                <th className="p-3 font-semibold w-5/12">السنة الأكاديمية</th>
                <th className="p-3 font-semibold w-3/12">تاريخ البداية</th>
                <th className="p-3 font-semibold w-3/12">تاريخ النهاية</th>
                <th className="p-3 font-semibold text-center w-2/12">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {years.length > 0 ? (
                years.map((year, index) => (
                  <tr
                    key={year.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                      {year.label}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {new Date(year.startDate).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {new Date(year.endDate).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(year)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <Edit size={16} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(year.id)}
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
                    colSpan={5}
                    className="p-3 text-center text-gray-500 dark:text-gray-400"
                  >
                    {loading
                      ? "جاري التحميل..."
                      : "لا توجد سنوات أكاديمية حالياً"}
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
          dir="rtl"
          onClick={() => setShowDialog(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800 dark:text-white">
              {editingYear
                ? "تعديل السنة الأكاديمية"
                : "إضافة سنة أكاديمية جديدة"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  تاريخ النهاية
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded-lg text-white transition flex items-center gap-2 ${
                  loading
                    ? "bg-emerald-600 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-md"
                }`}
                disabled={loading}
              >
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                {editingYear ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
