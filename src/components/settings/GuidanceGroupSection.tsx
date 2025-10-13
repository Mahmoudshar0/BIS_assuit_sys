"use client";

import React, { useEffect, useState } from "react";
import { Plus, Loader2, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

interface GuidanceGroup {
  id: number;
  groupName: string;
  enLevel: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function GuidanceGroupSection() {
  const [groups, setGroups] = useState<GuidanceGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GuidanceGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [enLevel, setEnLevel] = useState<number>(1);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/GuidanceGroup`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
      toast.error("حدث خطأ أثناء جلب المجموعات. تحقق من الكونسول.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      const isEdit = Boolean(editingGroup);
      const url = isEdit
        ? `${apiUrl}/GuidanceGroup/${editingGroup!.id}`
        : `${apiUrl}/GuidanceGroup`;
      const method = isEdit ? "PUT" : "POST";

      const payload: any = {
        groupName: groupName.trim(),
        enLevel: enLevel,
      };

      if (isEdit) payload.id = editingGroup!.id;

      if (!payload.groupName || payload.enLevel <= 0) {
        toast.error("الرجاء تعبئة جميع الحقول بشكل صحيح.");
        setLoading(false);
        return;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save group.");

      await fetchGroups();
      setShowDialog(false);
      setEditingGroup(null);
      setGroupName("");
      setEnLevel(1);
      toast.success(
        isEdit ? "تم تحديث المجموعة بنجاح." : "تم إضافة المجموعة بنجاح."
      );
    } catch (err) {
      console.error("Error saving group:", err);
      toast.error(
        `فشل ${editingGroup ? "التعديل" : "الإضافة"}. تحقق من الكونسول.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group: GuidanceGroup) => {
    setEditingGroup(group);
    setGroupName(group.groupName);
    setEnLevel(group.enLevel);
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المجموعة؟")) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/GuidanceGroup/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete group.");

      await fetchGroups();
      toast.success("تم حذف المجموعة بنجاح.");
    } catch (err) {
      console.error("Error deleting group:", err);
      toast.error("فشل الحذف. تحقق من الكونسول.");
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
          إدارة مجموعات الإرشاد
        </h2>
        <button
          onClick={() => {
            setEditingGroup(null);
            setGroupName("");
            setEnLevel(1);
            setShowDialog(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
          disabled={loading}
        >
          <Plus size={20} />
          إضافة مجموعة إرشاد
        </button>
      </div>

      {loading && groups.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="mr-3 text-lg text-gray-600 dark:text-gray-300">
            جاري تحميل البيانات...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <thead className="bg-emerald-600 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-right bg-emerald-600 text-white dark: bg-emerald-600 text-white">
                <th className="p-3 font-semibold text-center">#</th>
                <th className="p-3 font-semibold">اسم المجموعة</th>
                <th className="p-3 font-semibold">المستوى</th>
                <th className="p-3 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {groups.length > 0 ? (
                groups.map((group, index) => (
                  <tr
                    key={group.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {group.groupName}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {group.enLevel}
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(group)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <Edit size={16} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
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
                    colSpan={4}
                    className="p-3 text-center text-gray-500 dark:text-gray-400"
                  >
                    {loading
                      ? "جاري التحميل..."
                      : "لا توجد مجموعات إرشاد حالياً"}
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
              {editingGroup ? "تعديل مجموعة إرشاد" : "إضافة مجموعة إرشاد جديدة"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  اسم المجموعة
                </label>
                <input
                  type="text"
                  placeholder="أدخل اسم المجموعة"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  المستوى
                </label>
                <select
                  value={enLevel}
                  onChange={(e) => setEnLevel(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={1}>Level 1</option>
                  <option value={2}>Level 2</option>
                  <option value={3}>Level 3</option>
                  <option value={4}>Level 4</option>
                </select>
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
                {editingGroup ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
