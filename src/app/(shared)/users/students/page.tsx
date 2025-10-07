"use client";

import React from "react";

export default function StudentsPage() {
  const mockStudents = [
    { id: "2023001", name: "أحمد علي", level: "الفرقة الثالثة", status: "نشط" },
    {
      id: "2023002",
      name: "فاطمة محمد",
      level: "الفرقة الرابعة",
      status: "نشط",
    },
    {
      id: "2023003",
      name: "يوسف خالد",
      level: "الفرقة الأولى",
      status: "موقوف",
    },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        إدارة الطلاب
      </h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">عرض وإدارة سجلات جميع الطلاب في الكلية.</p>
        <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-200">
          + إضافة طالب جديد
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الرقم الجامعي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الفرقة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockStudents.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {student.level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === "نشط"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-900 ml-3"
                  >
                    تعديل
                  </a>
                  <a href="#" className="text-red-600 hover:text-red-900">
                    حذف
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
