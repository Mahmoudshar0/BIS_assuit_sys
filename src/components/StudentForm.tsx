"use client";

import React, { useState, useEffect } from "react";
import { Student, StudentPayload } from "@/actions/Student/types";

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: StudentPayload) => Promise<void>;
  onCancel: () => void;
}

export default function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<StudentPayload>({
    studentID: student?.studentID || 0,
    gpa: student?.gpa || 0,
    studentLevel: student?.studentLevel || 1,
    guidanceGroupID: student?.guidanceGroupID || 1,
    user: {
      id: student?.user.id || 0,
      name: student?.user.name || "",
      email: student?.user.email || "",
      phone: student?.user.phone || "",
      nationalNo: student?.user.nationalNo || "",
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("user.")) {
      const userField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [userField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === "gpa" || name === "studentLevel" || name === "guidanceGroupID" || name === "studentID" 
          ? Number(value) 
          : value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-black">
          {student ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
        </h2>

        {error && (
          <div className="mb-4 p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الرقم الجامعي
              </label>
              <input
                type="number"
                name="studentID"
                value={formData.studentID}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                required
                disabled={!!student}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="user.name"
                value={formData.user.name}
                onChange={handleInputChange}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="user.email"
                value={formData.user.email}
                onChange={handleInputChange}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="user.phone"
                value={formData.user.phone}
                onChange={handleInputChange}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الرقم القومي
              </label>
              <input
                type="text"
                name="user.nationalNo"
                value={formData.user.nationalNo}
                onChange={handleInputChange}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الفرقة الدراسية
              </label>
              <select
                name="studentLevel"
                value={formData.studentLevel}
                onChange={handleInputChange}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value={1}>الفرقة الأولى</option>
                <option value={2}>الفرقة الثانية</option>
                <option value={3}>الفرقة الثالثة</option>
                <option value={4}>الفرقة الرابعة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المعدل التراكمي
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                name="gpa"
                value={formData.gpa}
                onChange={handleInputChange}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مجموعة الإرشاد
              </label>
              <input
                type="number"
                name="guidanceGroupID"
                value={formData.guidanceGroupID}
                onChange={handleInputChange}
                className="text-black  w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "جاري الحفظ..." : (student ? "تحديث" : "حفظ")}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-semibold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}