"use client";

import React, { useEffect, useState } from "react";
import { fetchStudents } from "@/actions/Student/fetchStudents";
import { addStudent } from "@/actions/Student/addStudent";
import { updateStudent } from "@/actions/Student/updateStudent";
import { deleteStudent } from "@/actions/Student/deleteStudent";
import { fetchRoles } from "@/actions/Role/fetchRoles";
import { fetchGuidanceGroups } from "@/actions/GuidanceGroup/fetchGuidanceGroups";
import { Student } from "@/actions/Student/types";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState<any>({
    id: null,
    gpa: "",
    enrollmentDate: "",
    studentLevel: "1",
    guidanceGroupID: "",
    user: {
      id: null,
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      nationalNo: "",
      profileImage: "",
      roleId: "",
    },
  });

  const resetForm = () =>
    setFormData({
      id: null,
      gpa: "",
      enrollmentDate: "",
      studentLevel: "1",
      guidanceGroupID: "",
      user: {
        id: null,
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        nationalNo: "",
        profileImage: "",
        roleId: "",
      },
    });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [studentsRes, rolesRes, groupsRes] = await Promise.all([
        fetchStudents(),
        fetchRoles(),
        fetchGuidanceGroups(),
      ]);
      setStudents(studentsRes);
      setRoles(rolesRes);
      setGroups(groupsRes);
    } catch (err) {
      toast.error("❌ فشل تحميل البيانات");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.startsWith("user.")) {
      const key = name.split(".")[1];
      setFormData((prev: any) => ({
        ...prev,
        user: { ...prev.user, [key]: value },
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.user.name || !formData.user.email || !formData.user.roleId) {
      toast.error("❌ يرجى تعبئة جميع البيانات الأساسية");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        gpa: Number(formData.gpa),
        studentLevel: Number(formData.studentLevel),
        guidanceGroupID: Number(formData.guidanceGroupID),
        user: {
          ...formData.user,
          roleId: Number(formData.user.roleId),
        },
      };

      if (!isEdit) {
        await addStudent(payload);
        toast.success("✅ تم إضافة الطالب بنجاح");
      } else {
        await updateStudent(formData.id!, payload);
        toast.success("✅ تم تعديل بيانات الطالب بنجاح");
      }

      setShowModal(false);
      resetForm();
      loadAll();
    } catch {
      toast.error("❌ فشل العملية");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student: Student) => {
    setIsEdit(true);
    setFormData({
      id: student.studentID,
      gpa: student.gpa,
      enrollmentDate: student.enrollmentDate.split("T")[0],
      studentLevel: student.studentLevel,
      guidanceGroupID: student.guidanceGroupID,
      user: {
        id: student.user.id,
        name: student.user.name,
        email: student.user.email,
        password: "",
        confirmPassword: "",
        phone: student.user.phone,
        nationalNo: student.user.nationalNo,
        profileImage: student.user.profileImage,
        roleId: 2, // Instructor/Student Role adjust if needed
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف الطالب؟")) return;
    try {
      await deleteStudent(id);
      toast.success("✅ تم الحذف بنجاح");
      loadAll();
    } catch {
      toast.error("❌ فشل الحذف");
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg transition">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إدارة الطلاب
          </h1>
          <button
            onClick={() => {
              resetForm();
              setIsEdit(false);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700"
          >
            <Plus size={18} /> إضافة طالب
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-right divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3">الرقم الجامعي</th>
                <th className="px-6 py-3">الاسم</th>
                <th className="px-6 py-3">المستوى</th>
                <th className="px-6 py-3">الجروب</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="dark:bg-gray-900 divide-y dark:divide-gray-800">
              {students.map((student) => (
                <tr
                  key={student.studentID}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {student.studentID}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {student.user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {student.studentLevel}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {student.guidanceGroupID}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      className="text-indigo-600 dark:text-indigo-400 ml-3"
                      onClick={() => handleEdit(student)}
                    >
                      تعديل
                    </button>
                    <button
                      className="text-red-600 dark:text-red-400"
                      onClick={() => handleDelete(student.studentID)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 dark:text-gray-400"
                  >
                    لا يوجد طلاب حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-3xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {isEdit ? "تعديل بيانات طالب" : "إضافة طالب"}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "user.name", placeholder: "اسم الطالب" },
                { name: "user.email", placeholder: "البريد" },
                { name: "user.phone", placeholder: "الهاتف" },
                { name: "user.nationalNo", placeholder: "الرقم القومي" },
                { name: "gpa", placeholder: "GPA", type: "number" },
                { name: "enrollmentDate", type: "date" },
              ].map((item) => (
                <input
                  key={item.name}
                  type={item.type || "text"}
                  name={item.name}
                  value={
                    item.name.startsWith("user.")
                      ? formData.user[item.name.split(".")[1]]
                      : formData[item.name]
                  }
                  onChange={handleChange}
                  placeholder={item.placeholder}
                  className="inputField"
                />
              ))}

              <select
                name="studentLevel"
                value={formData.studentLevel}
                onChange={handleChange}
                className="inputField"
              >
                <option value="1">الفرقة الأولى</option>
                <option value="2">الفرقة الثانية</option>
                <option value="3">الفرقة الثالثة</option>
                <option value="4">الفرقة الرابعة</option>
              </select>

              <select
                name="guidanceGroupID"
                value={formData.guidanceGroupID}
                onChange={handleChange}
                className="inputField"
              >
                <option value="">اختر الجروب</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.groupName}
                  </option>
                ))}
              </select>

              <select
                name="user.roleId"
                value={formData.user.roleId}
                onChange={handleChange}
                className="inputField"
              >
                <option value="">اختر الدور</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {!isEdit && (
                <>
                  <input
                    type="password"
                    name="user.password"
                    placeholder="كلمة السر"
                    onChange={handleChange}
                    className="inputField"
                  />
                  <input
                    type="password"
                    name="user.confirmPassword"
                    placeholder="تأكيد كلمة السر"
                    onChange={handleChange}
                    className="inputField"
                  />
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-400 rounded"
                onClick={() => setShowModal(false)}
              >
                إلغاء
              </button>

              <button
                disabled={saving}
                onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
