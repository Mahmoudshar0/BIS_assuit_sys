"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, X, Search, Loader2 } from "lucide-react";

interface Room {
  id: number;
  name: string;
  capacity: number;
  location: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function RoomSection() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    location: "",
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/Room`);
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("فشل في جلب بيانات القاعات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity" && value ? String(parseInt(value) || 0) : value,
    }));
  };

  const handleOpenModal = (room: Room | null = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        capacity: String(room.capacity),
        location: room.location,
      });
    } else {
      setEditingRoom(null);
      setFormData({ name: "", capacity: "", location: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({ name: "", capacity: "", location: "" });
  };

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.capacity ||
      !formData.location.trim()
    ) {
      toast.error("الرجاء تعبئة جميع الحقول.");
      return;
    }

    const capacityValue = parseInt(formData.capacity, 10);
    if (isNaN(capacityValue) || capacityValue <= 0) {
      toast.error("يجب أن تكون السعة عدداً صحيحاً وموجباً.");
      return;
    }

    try {
      setLoading(true);
      const isEdit = Boolean(editingRoom);
      const url = isEdit
        ? `${apiUrl}/Room/${editingRoom!.id}`
        : `${apiUrl}/Room`;
      const method = isEdit ? "PUT" : "POST";

      const payload: any = {
        name: formData.name.trim(),
        capacity: capacityValue,
        location: formData.location.trim(),
      };

      if (isEdit) payload.id = editingRoom!.id;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`Failed to ${isEdit ? "update" : "add"} room`);

      await fetchRooms();
      handleCloseModal();
      toast.success(
        isEdit ? "تم تحديث القاعة بنجاح." : "تم إضافة القاعة بنجاح."
      );
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error(`فشل ${editingRoom ? "التعديل" : "الإضافة"}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه القاعة؟")) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/Room/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete room");

      await fetchRooms();
      toast.success("تم حذف القاعة بنجاح.");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("فشل الحذف.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    const lowercasedSearch = searchTerm.toLowerCase().trim();
    if (!lowercasedSearch) return rooms;
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(lowercasedSearch) ||
        room.location.toLowerCase().includes(lowercasedSearch) ||
        String(room.capacity).includes(lowercasedSearch)
    );
  }, [rooms, searchTerm]);

  return (
    <div
      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          إدارة قاعات الدراسة
        </h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          disabled={loading}
        >
          <Plus size={20} />
          إضافة قاعة
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث باسم القاعة، السعة، أو الموقع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      {loading && filteredRooms.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="mr-3 text-lg text-gray-600 dark:text-gray-300">
            جاري تحميل البيانات...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <thead className="bg-emerald-600 text-white">
              <tr className="text-right text-gray-600 dark:text-gray-300">
                <th className="p-3 font-semibold text-center w-1/12">الرقم</th>
                <th className="p-3 font-semibold w-4/12">اسم القاعة</th>
                <th className="p-3 font-semibold w-2/12">السعة</th>
                <th className="p-3 font-semibold w-3/12">الموقع</th>
                <th className="p-3 font-semibold text-center w-2/12">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room, index) => (
                  <tr
                    key={room.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {room.name}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {room.capacity}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {room.location}
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(room)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <Edit size={16} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <Trash2 size={16} /> حذف
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
                      : searchTerm
                      ? "لا توجد نتائج بحث مطابقة"
                      : "لا توجد قاعات حالياً"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4"
          dir="rtl"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800 dark:text-white">
              {editingRoom ? "تعديل بيانات القاعة" : "إضافة قاعة جديدة"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  اسم القاعة
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="مثال: قاعة A1"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  السعة (عدد الطلاب)
                </label>
                <input
                  type="number"
                  name="capacity"
                  min={1}
                  placeholder="مثال: 50"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  الموقع (الطابق/المبنى)
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="مثال: المبنى أ - الطابق الثالث"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-lg text-white transition flex items-center gap-2 ${
                  loading
                    ? "bg-emerald-600 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-md"
                }`}
                disabled={loading}
              >
                {loading && <Loader2 className="animate-spin h-5 w-5" />}
                <Save size={20} className={loading ? "hidden" : ""} />
                {editingRoom ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
