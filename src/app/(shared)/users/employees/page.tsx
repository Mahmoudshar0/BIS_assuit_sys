"use client";
import React from "react";

export default function EmployeesPage() {
  const mockEmployees = [
    { id: "E201", name: "أمين السيد", dept: "الشؤون المالية", job: "محاسب" },
    { id: "E202", name: "ليلى جمال", dept: "شؤون الطلاب", job: "مسؤول القبول" },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        إدارة الموظفين
      </h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">عرض وإدارة سجلات الموظفين الإداريين.</p>
        <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-200">
          + إضافة موظف جديد
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكود
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                القسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الوظيفة
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockEmployees.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.dept}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.job}
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
