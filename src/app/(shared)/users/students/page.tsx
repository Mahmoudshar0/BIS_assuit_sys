"use client";

import React, { useState, useEffect } from "react";
import { fetchStudents } from "@/actions/Student/fetchStudents";
import { addStudentsUsingFile } from "@/actions/Student/addStudentsUsingFile";
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudents();
      setStudents(data);
      console.log("Fetched students:", data);
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
    try {
      setDeletingId(studentID);
      await deleteStudent(studentID);
      setStudents((prev) => prev.filter((s) => s.studentID !== studentID));
      setDeleteError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل حذف الطالب";
      setDeleteError(errorMessage);
      setTimeout(() => setDeleteError(null), 4000);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const openDeleteModal = (studentID: number) => {
    setStudentToDelete(studentID);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
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

  const getLevelText = (level: string): string => {
    const levels: { [key: string]: string } = {
      الاول: "الفرقة الأولى",
      الثانى: "الفرقة الثانية",
      الثالث: "الفرقة الثالثة",
      الرابع: "الفرقة الرابعة",
    };
    return levels[level] || level;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Only accept Excel files
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setUploadMessage("يرجى اختيار ملف Excel بصيغة xlsx أو xls فقط.");
      setTimeout(() => setUploadMessage(null), 4000);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await addStudentsUsingFile(file);
      await loadStudents();
      setUploadMessage("تم رفع الملف بنجاح!");
      setTimeout(() => setUploadMessage(null), 4000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل رفع الملف";
      setUploadMessage(errorMessage);
      setTimeout(() => setUploadMessage(null), 4000);
    } finally {
      setLoading(false);
    }
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
          <label
            htmlFor="file-upload"
            className="max-w-[200px] bg-indigo-600 text-white py-2 px-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-200 cursor-pointer flex items-center justify-center"
          >
            تحميل ملف طلاب
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-lg text-center">
          {error}
        </div>
      )}
      {uploadMessage && (
        <div
          className={`mb-4 p-3 text-sm font-medium text-center rounded-lg ${
            uploadMessage.includes("نجاح")
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {uploadMessage}
        </div>
      )}
      {deleteError && (
        <div className="mb-4 p-3 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-lg text-center">
          {deleteError}
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
                    {student.gpa?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 ml-3"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => openDeleteModal(student.studentID)}
                      disabled={deletingId === student.studentID}
                      className={`text-red-600 w-[130px] dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ${
                        deletingId === student.studentID
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {deletingId === student.studentID
                        ? "جاري الحذف..."
                        : "حذف"}
                    </button>
                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                      <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
                            تأكيد حذف الطالب
                          </h3>
                          <p className="mb-6 text-gray-700 dark:text-gray-300 text-center">
                            هل أنت متأكد أنك تريد حذف هذا الطالب؟ لا يمكن
                            التراجع عن هذا الإجراء.
                          </p>
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={closeDeleteModal}
                              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
                            >
                              إلغاء
                            </button>
                            <button
                              onClick={() =>
                                studentToDelete && handleDelete(studentToDelete)
                              }
                              className="bg-red-600 w-[130px] max-w-[130px] hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
                              disabled={deletingId === studentToDelete}
                            >
                              {deletingId === studentToDelete
                                ? "جاري الحذف..."
                                : "تأكيد الحذف"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
