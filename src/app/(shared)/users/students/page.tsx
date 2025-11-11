"use client";

import React, { useState, useEffect } from "react";
import { fetchStudents } from "@/actions/Student/fetchStudents";
import { deleteStudent } from "@/actions/Student/deleteStudent";
import { addStudent } from "@/actions/Student/addStudent";
import { updateStudent } from "@/actions/Student/updateStudent";
import { Student, StudentPayload } from "@/actions/Student/types";
import StudentForm from "@/components/StudentForm";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل تحميل بيانات الطلاب";
      setError(errorMessage);
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentID: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
      return;
    }

    try {
      setDeletingId(studentID);
      await deleteStudent(studentID);
      // Remove the student from the list
      setStudents(students.filter((s) => s.studentID !== studentID));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل حذف الطالب";
      alert(errorMessage);
      console.error("Error deleting student:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: StudentPayload) => {
    try {
      if (editingStudent) {
        // Update existing student
        await updateStudent(data);
        // Refresh the student list
        await loadStudents();
      } else {
        // Add new student
        await addStudent(data);
        // Refresh the student list
        await loadStudents();
      }
      setShowForm(false);
      setEditingStudent(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل حفظ البيانات";
      throw new Error(errorMessage);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const getLevelText = (level: number): string => {
    const levels = [
      "",
      "الفرقة الأولى",
      "الفرقة الثانية",
      "الفرقة الثالثة",
      "الفرقة الرابعة",
    ];
    return levels[level] || `الفرقة ${level}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        إدارة الطلاب
      </h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          عرض وإدارة سجلات جميع الطلاب في الكلية.
        </p>
        <div className="flex gap-2">
          <button
            onClick={loadStudents}
            className="bg-gray-600 dark:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-gray-700 dark:hover:bg-gray-600 transition duration-200"
          >
            تحديث
          </button>
          <button
            onClick={handleAddStudent}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-200"
          >
            + إضافة طالب جديد
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-lg text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <span className="text-gray-600 dark:text-gray-400">
            جارٍ تحميل البيانات...
          </span>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-gray-600 dark:text-gray-400">
            لا توجد بيانات طلاب
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الرقم الجامعي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الفرقة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المعدل التراكمي
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr
                  key={student.studentID}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {student.studentID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {getLevelText(student.studentLevel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {student.gpa.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 ml-3"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(student.studentID)}
                      disabled={deletingId === student.studentID}
                      className={`text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ${
                        deletingId === student.studentID
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {deletingId === student.studentID
                        ? "جاري الحذف..."
                        : "حذف"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingStudent ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
              </h2>
              <button
                onClick={handleFormCancel}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <StudentForm
              student={editingStudent || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
