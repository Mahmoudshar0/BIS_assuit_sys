"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreateSessionsScheduleDTO,
  EnSessionType,
  EnWeekDays,
} from "@/actions/Schedule/types";
import { createSession, updateSession } from "@/actions/Schedule/scheduleActions";
import { toast } from "sonner";
import { Save, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Course } from "@/actions/Course/types";
import { fetchCoursesByLevel } from "@/actions/Course/fetchCoursesByLevel";
import { GuidanceGroup } from "@/actions/GuidanceGroup/types";
import { fetchGuidanceGroupsByLevel } from "@/actions/GuidanceGroup/fetchGuidanceGroupsByLevel";

interface SessionFormProps {
  initialData?: CreateSessionsScheduleDTO & { sessionId?: number };
  isEdit?: boolean;
}

export default function SessionForm({ initialData, isEdit = false }: SessionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSessionsScheduleDTO>(
    initialData || {
      courseId: 0,
      sessionType: EnSessionType.Lecture,
      roomId: 0,
      guidanceGroupId: 0,
      day: EnWeekDays.Saturday,
      startTime: "",
      endTime: "",
      academiceYearId: 0,
      semesterId: 0,
    }
  );
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedGuidanceGroupFilter, setSelectedGuidanceGroupFilter] = useState<number>(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [guidanceGroups, setGuidanceGroups] = useState<GuidanceGroup[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, groupsData] = await Promise.all([
          fetchCoursesByLevel(selectedLevel),
          fetchGuidanceGroupsByLevel(selectedLevel),
        ]);
        setCourses(coursesData);
        setGuidanceGroups(groupsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("فشل تحميل البيانات");
      }
    };
    loadData();
  }, [selectedLevel]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "startTime" || name === "endTime"
          ? value
          : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && initialData?.sessionId) {
        await updateSession({ ...formData, sessionId: initialData.sessionId });
        toast.success("تم تحديث المحاضرة بنجاح");
      } else {
        await createSession(formData);
        toast.success("تم إضافة المحاضرة بنجاح");
      }
      router.push("/schedule");
      router.refresh();
    } catch (error) {
      console.error("Failed to save session:", error);
      toast.error("فشل حفظ المحاضرة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enhanced Filter Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl shadow-lg border-2 border-emerald-200">
        <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          تصفية البيانات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Level Filter */}
          <div>
            <label className="block text-sm font-semibold text-emerald-800 mb-2">
              المستوى الدراسي
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(Number(e.target.value));
                setSelectedGuidanceGroupFilter(0);
              }}
              className="w-full p-3 bg-white border-2 border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all text-black shadow-sm hover:border-emerald-400"
            >
              <option value={1}>المستوى الأول</option>
              <option value={2}>المستوى الثاني</option>
              <option value={3}>المستوى الثالث</option>
              <option value={4}>المستوى الرابع</option>
            </select>
          </div>

          {/* Guidance Group Filter */}
          <div>
            <label className="block text-sm font-semibold text-emerald-800 mb-2">
              تصفية المجموعة
            </label>
            <select
              value={selectedGuidanceGroupFilter}
              onChange={(e) => setSelectedGuidanceGroupFilter(Number(e.target.value))}
              className="w-full p-3 bg-white border-2 border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all text-black shadow-sm hover:border-emerald-400"
            >
              <option value={0}>جميع المجموعات</option>
              {guidanceGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Course ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المادة (Course)
          </label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
          >
            <option value={0}>اختر المادة</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName} ({course.courseCode})
              </option>
            ))}
          </select>
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع المحاضرة
          </label>
          <select
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
          >
            <option value={EnSessionType.Lecture}>محاضرة</option>
            <option value={EnSessionType.Section}>سكشن</option>
            <option value={EnSessionType.Lab}>معمل</option>
          </select>
        </div>

        {/* Room ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم القاعة (Room ID)
          </label>
          <input
            type="number"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
          />
        </div>

        {/* Guidance Group ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المجموعة (Group)
          </label>
          <select
            name="guidanceGroupId"
            value={formData.guidanceGroupId}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
          >
            <option value={0}>اختر المجموعة</option>
            {guidanceGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.groupName}
              </option>
            ))}
          </select>
        </div>

        {/* Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اليوم
          </label>
          <select
            name="day"
            value={formData.day}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
          >
            <option value={EnWeekDays.Saturday}>السبت</option>
            <option value={EnWeekDays.Sunday}>الأحد</option>
            <option value={EnWeekDays.Monday}>الاثنين</option>
            <option value={EnWeekDays.Tuesday}>الثلاثاء</option>
            <option value={EnWeekDays.Wednesday}>الأربعاء</option>
            <option value={EnWeekDays.Thursday}>الخميس</option>
            <option value={EnWeekDays.Friday}>الجمعة</option>
          </select>
        </div>

        {/* Academic Year ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم السنة الدراسية (Year ID)
          </label>
          <input
            type="number"
            name="academiceYearId"
            value={formData.academiceYearId}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
          />
        </div>

        {/* Semester ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الفصل الدراسي (Semester ID)
          </label>
          <input
            type="number"
            name="semesterId"
            value={formData.semesterId}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
          />
        </div>

        {/* Time Range */}
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وقت البدء
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وقت الانتهاء
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 bg-white p-6 rounded-xl shadow-sm">
        <Link
          href="/schedule"
          className="px-6 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
        >
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {isEdit ? "حفظ التعديلات" : "إضافة المحاضرة"}
        </button>
      </div>
    </form>
  );
}
