"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowRight, UserCheck, Calendar, Clock, MapPin, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { fetchSessionById } from "@/actions/Schedule/scheduleActions";
import { SessionsScheduleDTO, EnSessionType, EnWeekDays } from "@/actions/Schedule/types";

// Mock data for students
const MOCK_STUDENTS = [
  { id: 1, name: "أحمد محمد علي" },
  { id: 2, name: "سارة أحمد محمود" },
  { id: 3, name: "محمد إبراهيم حسن" },
  { id: 4, name: "فاطمة علي يوسف" },
  { id: 5, name: "محمود حسن علي" },
  { id: 6, name: "عمر خالد سعيد" },
  { id: 7, name: "نور أحمد كمال" },
  { id: 8, name: "يوسف محمد مصطفى" },
  { id: 9, name: "ليلى حسن إبراهيم" },
  { id: 10, name: "كريم علي محمود" },
];

type AttendanceStatus = "present" | "absent" | "late";

interface StudentAttendance {
  studentId: number;
  status: AttendanceStatus;
}

export default function AttendancePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = React.use(params);
  const router = useRouter();
  const [attendance, setAttendance] = useState<StudentAttendance[]>(
    MOCK_STUDENTS.map((student) => ({
      studentId: student.id,
      status: "present", // Default to present
    }))
  );
  const [session, setSession] = useState<SessionsScheduleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await fetchSessionById(Number(sessionId));
        setSession(data);
      } catch (error) {
        console.error("Failed to load session:", error);
        toast.error("فشل تحميل بيانات المحاضرة");
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionId]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("Saving attendance for session", sessionId, attendance);
    toast.success("تم حفظ الغياب بنجاح");
    setSaving(false);
    router.push("/schedule");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-emerald-600" />
            تسجيل الحضور والغياب
          </h1>
          <p className="text-gray-500 mt-1">تسجيل غياب الطلاب للمحاضرة</p>
        </div>
        <Link
          href="/schedule"
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
        >
          <ArrowRight size={20} />
          عودة للجدول
        </Link>
      </div>

      {/* Session Details Card */}
      {session && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-600" />
            تفاصيل المحاضرة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">المادة</p>
                <p className="font-medium text-gray-800">{session.courseName}</p>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {getSessionTypeName(session.sessionType)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">اليوم</p>
                <p className="font-medium text-gray-800">{getDayName(session.day)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">الوقت</p>
                <p className="font-medium text-gray-800" dir="ltr">
                  {session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">المكان</p>
                <p className="font-medium text-gray-800">{session.roomName}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Users size={12} />
                  <span>مجموعة {session.guidanceGroupId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">قائمة الطلاب</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="p-4 w-16">#</th>
                <th className="p-4">اسم الطالب</th>
                <th className="p-4 w-64">حالة الحضور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_STUDENTS.map((student, index) => {
                const studentStatus = attendance.find(
                  (a) => a.studentId === student.id
                )?.status;

                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 md:text-xl text-gray-500">{index + 1}</td>
                    <td className="p-4 font-medium md:text-xl text-gray-800">{student.name}</td>
                    <td className="p-4">
                      <select
                        value={studentStatus}
                        onChange={(e) =>
                          handleStatusChange(student.id, e.target.value as AttendanceStatus)
                        }
                        className={`w-full md:text-xl p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                          studentStatus === "present"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : studentStatus === "absent"
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-yellow-50 border-yellow-200 text-yellow-700"
                        }`}
                      >
                        <option value="present">حاضر</option>
                        <option value="absent">غائب</option>
                        <option value="late">متأخر</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            حفظ الغياب
          </button>
        </div>
      </div>
    </div>
  );
}
