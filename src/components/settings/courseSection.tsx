"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { Course, CoursePayload } from "@/actions/Course/types";
import { Semester } from "@/actions/semester/types";
import { AcademicYear } from "@/actions/AcademicYear/types";
import { fetchCourses } from "@/actions/Course/fetchCourses";
import { addCourse } from "@/actions/Course/addCourse";
import { updateCourse } from "@/actions/Course/updateCourse";
import { deleteCourse } from "@/actions/Course/deleteCourse";
import { fetchAcademicYears } from "@/actions/AcademicYear/GetAllYear";
import { fetchSemesters } from "@/actions/semester/fetchSemesters";

const DUMMY_LEVELS = [
  { id: 1, name: "المستوى الأول" },
  { id: 2, name: "المستوى الثاني" },
  { id: 3, name: "المستوى الثالث" },
  { id: 4, name: "المستوى الرابع" },
];

export default function CourseSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]); // استخدام البيانات الحقيقية
  const [loading, setLoading] = useState(true);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState<number>(3);
  const [enCourseLevel, setEnCourseLevel] = useState<number>(
    DUMMY_LEVELS[0]?.id || 1
  );
  const [academiceYearId, setAcademiceYearId] = useState<number>(0);
  const [semesterId, setSemesterId] = useState<number>(0);

  const fetchReferences = useCallback(async () => {
    try {
      setLoadingRefs(true);

      const yearsData = await fetchAcademicYears();
      setAcademicYears(yearsData);
      if (yearsData.length > 0) {
        setAcademiceYearId(yearsData[0].id);
      }

      const semestersData = await fetchSemesters();
      setSemesters(semestersData);
      if (semestersData.length > 0) {
        setSemesterId(semestersData[0].id);
      }
    } catch (err) {
      console.error("❌ Error fetching references:", err);
    } finally {
      setLoadingRefs(false);
    }
  }, []);

  const fetchAllCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCourses();
      setCourses(data);
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
      toast.error("حدث خطأ أثناء جلب المقررات الدراسية.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferences();
    fetchAllCourses();
  }, [fetchReferences, fetchAllCourses]);

  const resetFields = () => {
    setCourseCode("");
    setCourseName("");
    setCreditHours(3);
    setEnCourseLevel(DUMMY_LEVELS[0]?.id || 1);
    setAcademiceYearId(academicYears.length > 0 ? academicYears[0].id : 0);
    setSemesterId(semesters.length > 0 ? semesters[0].id : 0);
    setEditingCourse(null);
  };

  const handleSave = async () => {
    if (
      !courseCode ||
      !courseName ||
      creditHours <= 0 ||
      academiceYearId === 0 ||
      semesterId === 0
    ) {
      toast.error("الرجاء إكمال جميع الحقول الإلزامية.");
      return;
    }

    try {
      setLoading(true);
      const isEdit = Boolean(editingCourse);

      const payload: CoursePayload = {
        courseCode,
        courseName,
        creditHours,
        enCourseLevel,
        academiceYearId,
        semesterId,
      };

      if (isEdit) payload.id = editingCourse!.id;

      if (isEdit) {
        await updateCourse(editingCourse!.id, payload);
      } else {
        await addCourse(payload);
      }

      toast.success(
        isEdit
          ? "تم تحديث المقرر الدراسي بنجاح."
          : "تم إضافة المقرر الدراسي بنجاح."
      );

      await fetchAllCourses();
      setShowDialog(false);
      resetFields();
    } catch (err) {
      console.error("❌ Error saving course:", err);
      const errorMessage = err instanceof Error ? err.message : "فشل الحفظ.";
      toast.error(
        `فشل ${editingCourse ? "التعديل" : "الإضافة"}. ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setCourseCode(course.courseCode);
    setCourseName(course.courseName);
    setCreditHours(course.creditHours);
    setEnCourseLevel(course.enCourseLevel);
    setAcademiceYearId(course.academiceYearId);
    setSemesterId(course.semesterId);
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المقرر الدراسي؟")) return;

    try {
      setLoading(true);
      await deleteCourse(id);

      toast.success("تم حذف المقرر الدراسي بنجاح.");

      await fetchAllCourses();
    } catch (err) {
      console.error("❌ Error deleting course:", err);
      const errorMessage = err instanceof Error ? err.message : "فشل الحذف.";
      toast.error(`فشل الحذف. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const isLoadingData = loading || loadingRefs;
  const isButtonDisabled = loading;

  const getLevelName = (levelId: number) => {
    return (
      DUMMY_LEVELS.find((l) => l.id === levelId)?.name || `المستوى ${levelId}`
    );
  };

  const getSemesterLabel = (semesterId: number) => {
    const semester = semesters.find((s) => s.id === semesterId);
    return semester ? `الفصل رقم ${semester.semesterNumber}` : `غير محدد`;
  };

  return (
    <div
      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          إدارة المقررات الدراسية
        </h2>
        <button
          onClick={() => {
            resetFields();
            setShowDialog(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            isButtonDisabled ||
            loadingRefs ||
            academicYears.length === 0 ||
            semesters.length === 0
          }
        >
          <Plus size={20} />
          إضافة مقرر دراسي
        </button>
      </div>

      {isLoadingData && courses.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="mr-3 text-lg text-gray-600 dark:text-gray-300">
            جاري تحميل البيانات...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-right text-white bg-emerald-600">
                <th className="p-3 font-semibold text-center w-[5%]">الرقم</th>
                <th className="p-3 font-semibold w-[15%]">رمز المقرر</th>
                <th className="p-3 font-semibold w-[30%]">اسم المقرر</th>
                <th className="p-3 font-semibold w-[10%]">الساعات المعتمدة</th>
                <th className="p-3 font-semibold w-[10%]">المستوى</th>
                <th className="p-3 font-semibold w-[15%]">السنة</th>
                <th className="p-3 font-semibold w-[15%]">الفصل</th>
                <th className="p-3 font-semibold text-center w-[15%]">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {courses.length > 0 ? (
                courses.map((course, index) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">
                      {course.courseCode}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {course.courseName}
                    </td>
                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                      {course.creditHours}
                    </td>
                    <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                      {course.levelName || getLevelName(course.enCourseLevel)}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {course.yearLabel}
                    </td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">
                      {course.semesterLabel}
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <Edit size={16} /> تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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
                    colSpan={8}
                    className="p-3 text-center text-gray-500 dark:text-gray-400"
                  >
                    {isLoadingData
                      ? "جاري التحميل..."
                      : "لا توجد مقررات دراسية حالياً"}
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
          onClick={() => {
            setShowDialog(false);
            resetFields();
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold border-b pb-3 mb-4 text-gray-800 dark:text-white">
              {editingCourse ? "تعديل المقرر الدراسي" : "إضافة مقرر دراسي جديد"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  رمز المقرر
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  اسم المقرر
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  الساعات المعتمدة
                </label>
                <input
                  type="number"
                  value={creditHours}
                  onChange={(e) => setCreditHours(Number(e.target.value))}
                  min="1"
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  المستوى
                </label>
                <select
                  value={enCourseLevel}
                  onChange={(e) => setEnCourseLevel(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                >
                  {DUMMY_LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  السنة الأكاديمية
                </label>
                {loadingRefs ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    جاري التحميل...
                  </p>
                ) : academicYears.length > 0 ? (
                  <select
                    value={academiceYearId}
                    onChange={(e) => setAcademiceYearId(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                  >
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-red-500 dark:text-red-400">
                    لا توجد سنوات أكاديمية متاحة.
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  الفصل الدراسي
                </label>
                {loadingRefs ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    جاري التحميل...
                  </p>
                ) : semesters.length > 0 ? (
                  <select
                    value={semesterId}
                    onChange={(e) => setSemesterId(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                  >
                    {semesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {`الفصل رقم ${semester.semesterNumber}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-red-500 dark:text-red-400">
                    لا توجد فصول دراسية متاحة.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDialog(false);
                  resetFields();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isButtonDisabled}
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded-lg text-white transition flex items-center gap-2 ${
                  isButtonDisabled ||
                  academicYears.length === 0 ||
                  semesters.length === 0
                    ? "bg-emerald-600 cursor-not-allowed opacity-50"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-md"
                }`}
                disabled={
                  isButtonDisabled ||
                  academicYears.length === 0 ||
                  semesters.length === 0
                }
              >
                {isButtonDisabled && (
                  <Loader2 className="animate-spin h-5 w-5" />
                )}
                {editingCourse ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
