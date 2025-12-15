"use client";

import React, { useEffect, useState } from "react";
import { decodeJwt } from "@/lib/auth";
import { Loader2, Calendar, MapPin, Clock } from "lucide-react";
import { Student } from "@/actions/Student/types";
import { SessionsScheduleDTO, EnSessionType, EnWeekDays } from "@/actions/Schedule/types";
import { fetchStudentById } from "@/actions/Student/fetchStudentById";
import { fetchScheduleByGuidanceGroup } from "@/actions/Schedule/fetchScheduleByGuidanceGroup";

export default function StudentSchedule() {
  const [schedule, setSchedule] = useState<SessionsScheduleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token found");
        }

        let guidanceGroupID: number | null = null;

        // 1. Try to get guidanceGroupID from cache
        const cachedData = localStorage.getItem("student_data_cache");
        if (cachedData) {
          const student: Student = JSON.parse(cachedData);
          guidanceGroupID = student.guidanceGroupID;
        }

        // 2. If not in cache, fetch student data
        if (!guidanceGroupID) {
          const claims = decodeJwt(token);
          if (!claims || !claims.id) {
            throw new Error("Invalid token or missing student ID");
          }

          const studentData = await fetchStudentById(claims.id);
          guidanceGroupID = studentData.guidanceGroupID;
          
          // Cache for future use
          localStorage.setItem("student_data_cache", JSON.stringify(studentData));
        }

        if (!guidanceGroupID) {
          throw new Error("Could not determine guidance group");
        }

        // 3. Fetch Schedule
        const scheduleData = await fetchScheduleByGuidanceGroup(guidanceGroupID);
        setSchedule(scheduleData);

      } catch (err: any) {
        console.error("Error fetching schedule:", err);
        setError(err.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  const getDayName = (day: EnWeekDays) => {
    const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
    return days[day] || "غير محدد";
  };

  const getSessionTypeName = (type: EnSessionType) => {
    const types = ["محاضرة", "سكشن", "معمل"];
    return types[type] || "غير محدد";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh] text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">جدول المحاضرات</h1>
        </div>

        {schedule.length === 0 ? (
          <p className="text-center text-gray-500 py-8">لا توجد محاضرات مسجلة حالياً</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="p-4 rounded-r-lg">اليوم</th>
                  <th className="p-4">المادة</th>
                  <th className="p-4">النوع</th>
                    <th className="p-4 flex items-center gap-2">
                      <MapPin className="w-3 h-4 text-gray-400" />
                      المكان
                  </th>
                    <th className="p-4 rounded-l-lg">
                    <Clock className="w-3 h-4 text-gray-400 inline ml-2" />
                      الوقت
                    </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedule.map((session) => (
                  <tr key={session.sessionId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{getDayName(session.day)}</td>
                    <td className="p-4 text-gray-600">{session.courseName}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        session.sessionType === EnSessionType.Lecture
                          ? "bg-blue-100 text-blue-700"
                          : session.sessionType === EnSessionType.Section
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {getSessionTypeName(session.sessionType)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 flex justify-center gap-2">
                      {session.roomName}
                    </td>
                    <td className="p-4 text-gray-600" dir="ltr">
                      <div className="flex items-center justify-center gap-2">
                        <span>{session.startTime.slice(0, 5)} - {session.endTime.slice(0, 5)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
