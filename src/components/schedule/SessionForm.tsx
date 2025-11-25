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
import { AcademicYear } from "@/actions/AcademicYear/types";
import { fetchAcademicYears } from "@/actions/AcademicYear/fetchAcademicYears";
import { Room } from "@/actions/Room/types";
import { fetchRooms } from "@/actions/Room/fetchRooms";
import { Semester } from "@/actions/semester/types";
import { fetchSemesters } from "@/actions/semester/fetchSemesters";

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
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Disable form until both filters are selected (only in create mode)
  // In edit mode, enable once initialData is present
  const isFormDisabled = isEdit 
    ? !initialData 
    : (selectedLevel === 0 || selectedGuidanceGroupFilter === 0);

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
  console.log(guidanceGroups)

  // Fetch academic years, rooms, and semesters on mount
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [yearsData, roomsData, semestersData] = await Promise.all([
          fetchAcademicYears(),
          fetchRooms(),
          fetchSemesters(),
        ]);
        setAcademicYears(yearsData);
        setRooms(roomsData);
        setSemesters(semestersData);
      } catch (error) {
        console.error("Failed to load static data:", error);
        toast.error("فشل تحميل البيانات الأساسية");
      }
    };
    loadStaticData();
  }, []);

  // Set level and guidance group filter when editing (initialData provided)
  useEffect(() => {
    const initializeFilters = async () => {
      if (initialData?.guidanceGroupId && initialData.guidanceGroupId > 0) {
        try {
          // Fetch all guidance groups to find the one matching initialData
          const allLevels = [1, 2, 3, 4];
          for (const level of allLevels) {
            const groups = await fetchGuidanceGroupsByLevel(level);
            const matchingGroup = groups.find(g => g.id === initialData.guidanceGroupId);
            if (matchingGroup) {
              setSelectedLevel(matchingGroup.enLevel);
              setSelectedGuidanceGroupFilter(initialData.guidanceGroupId);
              break;
            }
          }
        } catch (error) {
          console.error("Failed to initialize filters:", error);
        }
      }
    };
    initializeFilters();
  }, [initialData]);

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
      const submissionData = {
        ...formData,
        guidanceGroupId: selectedGuidanceGroupFilter,
      };

      if (isEdit && initialData?.sessionId) {
        await updateSession({ ...submissionData, sessionId: initialData.sessionId });
        toast.success("تم تحديث المحاضرة بنجاح");
      } else {
        await createSession(submissionData);
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
              مجموعة الارشاد
            </label>
            <select
              value={selectedGuidanceGroupFilter}
              onChange={(e) => setSelectedGuidanceGroupFilter(Number(e.target.value))}
              className="w-full p-3 bg-white border-2 border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all text-black shadow-sm hover:border-emerald-400"
            >
              <option value={0}>جميع المجموعات</option>
              {guidanceGroups.map((group) => (
                <option key={group.id} value={group.id} className="text-black">
                  {group.groupNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info Message when form is disabled */}
      {isFormDisabled && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">يرجى اختيار المستوى الدراسي ومجموعة التوجيه أولاً</h4>
            {/* <p className="text-sm text-amber-800">يجب اختيار المستوى الدراسي ومجموعة التوجيه قبل ملء بيانات الجلسة</p> */}
          </div>
        </div>
      )}

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
            disabled={isFormDisabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
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
            disabled={isFormDisabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value={EnSessionType.Lecture}>محاضرة</option>
            <option value={EnSessionType.Section}>سكشن</option>
          </select>
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
              disabled={isFormDisabled}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
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
              disabled={isFormDisabled}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* Room ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم القاعة
          </label>
          <select
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            required
            disabled={isFormDisabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value={0}>اختر القاعة</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
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
            disabled={isFormDisabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
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
            السنة الدراسية
          </label>
          <select
            name="academiceYearId"
            value={formData.academiceYearId}
            onChange={handleChange}
            required
            disabled={isFormDisabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value={0}>اختر السنة الدراسية</option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label || `${year.startDate} - ${year.endDate}`}
              </option>
            ))}
          </select>
        </div>

        {/* Semester ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الفصل الدراسي
          </label>
          <select
            name="semesterId"
            value={formData.semesterId}
            onChange={handleChange}
            required
            disabled={isFormDisabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-black disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value={0}>اختر الفصل الدراسي</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                الفصل {semester.semesterNumber} - {semester.academicYearLabel}
              </option>
            ))}
          </select>
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
          disabled={loading || isFormDisabled}
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
