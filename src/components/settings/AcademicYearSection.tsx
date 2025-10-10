"use client";

import React, { useEffect, useState } from "react";
import { Plus, Loader2, Edit, Trash } from "lucide-react";

export default function AcademicYearSection() {
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingYear, setEditingYear] = useState<any | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchYears = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/AcademicYear`);
      if (!res.ok) throw new Error("Failed to fetch academic years");
      const data = await res.json();
      console.log("✅ Fetched years:", data);
      setYears(data);
    } catch (err) {
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleSave = async () => {
    try {
      const method = editingYear ? "PUT" : "POST";
      const url = editingYear
        ? `${apiUrl}/AcademicYear/${editingYear.id}`
        : `${apiUrl}/AcademicYear`;

      const isEdit = Boolean(editingYear);

      const bodyObj = isEdit
        ? { id: editingYear.id, startDate, endDate }
        : { startDate, endDate };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      });

      if (!res.ok) throw new Error("Failed to save academic year");

      setShowDialog(false);
      setStartDate("");
      setEndDate("");
      setEditingYear(null);
      fetchYears();
    } catch (err) {
      console.error("❌ Error saving:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`${apiUrl}/AcademicYear/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete year");
      fetchYears();
    } catch (err) {
      console.error("❌ Error deleting:", err);
    }
  };

  const openDialog = (year?: any) => {
    if (year) {
      setEditingYear(year);
      setStartDate(year.startDate.slice(0, 10));
      setEndDate(year.endDate.slice(0, 10));
    } else {
      setEditingYear(null);
      setStartDate("");
      setEndDate("");
    }
    setShowDialog(true);
  };

  return (
    <section className="border border-gray-300 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          السنة الأكاديمية
        </h2>
        <button
          onClick={() => openDialog()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition"
        >
          <Plus size={18} /> إضافة سنة
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : years.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300 text-center py-8">
          لا توجد سنوات أكاديمية مضافة بعد.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 dark:border-gray-700 text-right">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3 border dark:border-gray-700">#</th>
                <th className="p-3 border dark:border-gray-700">السنة</th>
                <th className="p-3 border dark:border-gray-700">
                  تاريخ البداية
                </th>
                <th className="p-3 border dark:border-gray-700">
                  تاريخ النهاية
                </th>
                <th className="p-3 border dark:border-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y, i) => (
                <tr
                  key={y.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b text-gray-800 dark:text-gray-100"
                >
                  <td className="p-3 border dark:border-gray-700">{i + 1}</td>
                  <td className="p-3 border dark:border-gray-700">{y.label}</td>
                  <td className="p-3 border dark:border-gray-700">
                    {y.startDate.slice(0, 10)}
                  </td>
                  <td className="p-3 border dark:border-gray-700">
                    {y.endDate.slice(0, 10)}
                  </td>
                  <td className="p-3 border dark:border-gray-700 flex gap-3 justify-center">
                    <button
                      onClick={() => openDialog(y)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      title="تعديل"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(y.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      title="حذف"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4 dark:text-gray-100">
              {editingYear ? "تعديل السنة الأكاديمية" : "إضافة سنة جديدة"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  تاريخ النهاية
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
