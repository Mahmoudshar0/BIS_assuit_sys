"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Edit, Trash } from "lucide-react";

interface GuidanceGroup {
  id: number;
  groupName: string;
  enLevel: number;
  levelName?: string;
}

export default function GuidanceGroupSection() {
  const [groups, setGroups] = useState<GuidanceGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GuidanceGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [enLevel, setEnLevel] = useState<number>(1);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/GuidanceGroup`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data: GuidanceGroup[] = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
      alert("حدث خطأ أثناء جلب المجموعات. تحقق من الكونسول.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const isEdit = Boolean(editingGroup);
      const url = isEdit
        ? `${apiUrl}/GuidanceGroup/${editingGroup?.id}`
        : `${apiUrl}/GuidanceGroup`;

      const bodyObj = isEdit
        ? { id: editingGroup?.id, groupName, enLevel }
        : { groupName, enLevel };

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      });

      const text = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      if (!res.ok) {
        console.error("Save failed:", res.status, parsed);
        alert(`فشل الحفظ (status ${res.status}). راجع الكونسول للمزيد.`);
        return;
      }

      setShowDialog(false);
      setGroupName("");
      setEnLevel(1);
      setEditingGroup(null);
      fetchGroups();
    } catch (err) {
      console.error("Error saving group:", err);
      alert("حدث خطأ أثناء الحفظ. راجع الكونسول.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/GuidanceGroup/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Delete failed:", res.status, txt);
        alert(`فشل الحذف (status ${res.status}). راجع الكونسول.`);
        return;
      }

      fetchGroups();
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("حدث خطأ أثناء الحذف. راجع الكونسول.");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (group?: GuidanceGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.groupName);
      setEnLevel(group.enLevel);
    } else {
      setEditingGroup(null);
      setGroupName("");
      setEnLevel(1);
    }
    setShowDialog(true);
  };

  return (
    <section className="border border-gray-300 dark:border-gray-700 rounded-2xl p-5 mt-8 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          الإرشاد الأكاديمي
        </h2>
        <button
          onClick={() => openDialog()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition"
        >
          <Plus size={18} /> إضافة مجموعة
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : groups.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300 text-center py-8">
          لا توجد مجموعات إرشاد مضافة بعد.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 dark:border-gray-700 text-right">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3 border dark:border-gray-700">#</th>
                <th className="p-3 border dark:border-gray-700">
                  اسم المجموعة
                </th>
                <th className="p-3 border dark:border-gray-700">المستوى</th>
                <th className="p-3 border dark:border-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => (
                <tr
                  key={g.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b text-gray-800 dark:text-gray-100"
                >
                  <td className="p-3 border dark:border-gray-700">{i + 1}</td>
                  <td className="p-3 border dark:border-gray-700">
                    {g.groupName}
                  </td>
                  <td className="p-3 border dark:border-gray-700">
                    {g.levelName ?? `Level ${g.enLevel}`}
                  </td>
                  <td className="p-3 border dark:border-gray-700 flex gap-3 justify-center">
                    <button
                      onClick={() => openDialog(g)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      title="تعديل"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
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
              {editingGroup ? "تعديل المجموعة" : "إضافة مجموعة جديدة"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  اسم المجموعة
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                  المستوى
                </label>
                <select
                  value={enLevel}
                  onChange={(e) => setEnLevel(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                >
                  {[1, 2, 3, 4].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      Level {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                disabled={loading}
              >
                {loading ? "جارٍ..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
