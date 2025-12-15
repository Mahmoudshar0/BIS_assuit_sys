"use client";

import { useEffect, useState } from "react";
import {
  SessionsScheduleDTO,  
  EnSessionType,
  EnWeekDays,
} from "@/actions/Schedule/types";
import { fetchSchedule, deleteSession } from "@/actions/Schedule/scheduleActions";
import { fetchScheduleByGuidanceGroup } from "@/actions/Schedule/fetchScheduleByGuidanceGroup";
import { fetchScheduleBySemester } from "@/actions/Schedule/fetchScheduleBySemester";
import { fetchScheduleByAcademicYear } from "@/actions/Schedule/fetchScheduleByAcademicYear";
import { GuidanceGroup } from "@/actions/GuidanceGroup/types";
import { fetchGuidanceGroupsByLevel } from "@/actions/GuidanceGroup/fetchGuidanceGroupsByLevel";
import { AcademicYear } from "@/actions/AcademicYear/types";
import { fetchAcademicYears } from "@/actions/AcademicYear/fetchAcademicYears";
import { Semester } from "@/actions/semester/types";
import { Plus, Edit, Trash2, Calendar, Filter, UserCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SchedulePage() {
  const [sessions, setSessions] = useState<SessionsScheduleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number>(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [guidanceGroups, setGuidanceGroups] = useState<GuidanceGroup[]>([]);

  // Load academic years on mount
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const years = await fetchAcademicYears();
        setAcademicYears(years);
      } catch (error) {
        console.error("Failed to fetch academic years:", error);
        toast.error("فشل تحميل السنوات الدراسية");
      }
    };
    loadAcademicYears();
  }, []);

  // Load semesters when academic year changes
  useEffect(() => {
    if (selectedAcademicYear > 0) {
      const filteredSemesters = semesters.filter(
        (sem) => sem.academicYearId === selectedAcademicYear
      );
      if (filteredSemesters.length === 0) {
        // Fetch all semesters if not loaded yet
        const loadSemesters = async () => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/Semester`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (response.ok) {
              const allSemesters = await response.json();
              setSemesters(allSemesters);
            }
          } catch (error) {
            console.error("Failed to fetch semesters:", error);
          }
        };
        loadSemesters();
      }
    }
  }, [selectedAcademicYear, semesters]);

  // Load guidance groups when level changes
  useEffect(() => {
    const loadGroups = async () => {
      if (selectedLevel > 0) {
        try {
          const groups = await fetchGuidanceGroupsByLevel(selectedLevel);
          setGuidanceGroups(groups);
        } catch (error) {
          console.error("Failed to fetch groups:", error);
          toast.error("فشل تحميل المجموعات");
        }
      } else {
        setGuidanceGroups([]);
      }
    };
    loadGroups();
  }, [selectedLevel]);

  // Load schedule based on filters
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        let data;
        
        // Priority: Group > Semester > Academic Year > All
        if (selectedGroup > 0) {
          data = await fetchScheduleByGuidanceGroup(selectedGroup, selectedSemester || undefined);
        } else if (selectedSemester > 0) {
          data = await fetchScheduleBySemester(selectedSemester);
        } else if (selectedAcademicYear > 0) {
          data = await fetchScheduleByAcademicYear(selectedAcademicYear);
        } else {
          data = await fetchSchedule();
        }
        
        setSessions(data);
      } catch (error) {
        console.error("Failed to load schedule:", error);
        toast.error("فشل تحميل الجدول الدراسي");
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [selectedGroup, selectedSemester, selectedAcademicYear]);
  console.log(sessions)
  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المحاضرة؟")) {
      try {
        await deleteSession(id);
        toast.success("تم حذف المحاضرة بنجاح");
        
        // Reload with current filters
        let data;
        if (selectedGroup > 0) {
          data = await fetchScheduleByGuidanceGroup(selectedGroup, selectedSemester || undefined);
        } else if (selectedSemester > 0) {
          data = await fetchScheduleBySemester(selectedSemester);
        } else if (selectedAcademicYear > 0) {
          data = await fetchScheduleByAcademicYear(selectedAcademicYear);
        } else {
          data = await fetchSchedule();
        }
        setSessions(data);
      } catch (error) {
        console.error("Failed to delete session:", error);
        toast.error("فشل حذف المحاضرة");
      }
    }
  };

  const getDayName = (day: EnWeekDays) => {
    const days = [
      "السبت",
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
    ];
    return days[day] || "غير محدد";
  };

  const getSessionTypeName = (type: EnSessionType) => {
    const types = ["محاضرة", "سكشن", "معمل"];
    return types[type] || "غير محدد";
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-emerald-600" />
            الجدول الدراسي
          </h1>
          <p className="text-gray-500 mt-1">إدارة المحاضرات والجداول الدراسية</p>
        </div>
        <Link
          href="/schedule/create"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={20} />
          إضافة محاضرة
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 text-gray-700 mb-4">
          <Filter size={18} />
          <span className="font-medium">تصفية حسب:</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Academic Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السنة الدراسية
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => {
                setSelectedAcademicYear(Number(e.target.value));
                setSelectedSemester(0);
                setSelectedLevel(0);
                setSelectedGroup(0);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black"
            >
              <option value={0}>الكل</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.label || `${year.startDate} - ${year.endDate}`}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الفصل الدراسي
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(Number(e.target.value));
                setSelectedLevel(0);
                setSelectedGroup(0);
              }}
              disabled={selectedAcademicYear === 0}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value={0}>الكل</option>
              {semesters
                .filter((sem) => selectedAcademicYear === 0 || sem.academicYearId === selectedAcademicYear)
                .map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    الفصل {semester.semesterNumber}
                  </option>
                ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المستوى
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(Number(e.target.value));
                setSelectedGroup(0);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black"
            >
              <option value={0}>الكل</option>
              <option value={1}>المستوى الأول</option>
              <option value={2}>المستوى الثاني</option>
              <option value={3}>المستوى الثالث</option>
              <option value={4}>المستوى الرابع</option>
            </select>
          </div>

          {/* Guidance Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المجموعة
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(Number(e.target.value))}
              disabled={selectedLevel === 0}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-black disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value={0}>الكل</option>
              {guidanceGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.groupNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="p-4">اليوم</th>
                  <th className="p-4">المادة </th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">القاعة </th>
                  <th className="p-4">المجموعة </th>
                  <th className="p-4">الوقت</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      لا توجد محاضرات مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-800">
                        {getDayName(session.day)}
                      </td>
                      <td className="p-4 text-gray-600">{session.courseName}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.sessionType === EnSessionType.Lecture
                              ? "bg-blue-100 text-blue-700"
                              : session.sessionType === EnSessionType.Section
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {getSessionTypeName(session.sessionType)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{session.roomName}</td>
                      <td className="p-4 text-gray-600">
                        {session.guidanceGroupId}
                      </td>
                      <td className="p-4 text-gray-600" dir="ltr">
                        {session.startTime.slice(0,5)} - {session.endTime.slice(0,5)}
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <Link
                          href={`/schedule/attendance/${session.sessionId}`}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="اخذ الغياب"
                        >
                          <UserCheck size={18} />
                        </Link>
                        <Link
                          href={`/schedule/edit/${session.sessionId}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(session.sessionId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
