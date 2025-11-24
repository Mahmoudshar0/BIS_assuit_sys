"use client";

import { useEffect, useState, use } from "react";
import SessionForm from "@/components/schedule/SessionForm";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchSchedule } from "@/actions/Schedule/scheduleActions";
import { SessionsScheduleDTO } from "@/actions/Schedule/types";
import { toast } from "sonner";

export default function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [session, setSession] = useState<SessionsScheduleDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        // In a real app, we should have a fetchSessionById endpoint.
        // For now, we fetch all and filter (since we don't have a direct single fetch in actions yet, 
        // although the API supports it: GET /api/SessionsSchedule?sessionID=...)
        // Let's use the fetchSchedule action and filter client-side for now, 
        // or better, update the action to support fetching by ID if needed.
        // But wait, the API analysis showed: GET /api/SessionsSchedule?sessionID=...
        // I'll just fetch all for simplicity as per current action implementation, 
        // or I could add a specific fetch action. 
        // Given the time, I'll fetch all and find.
        
        const allSessions = await fetchSchedule();
        const found = allSessions.find((s) => s.sessionId === Number(id));
        
        if (found) {
          setSession(found);
        } else {
          toast.error("المحاضرة غير موجودة");
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        toast.error("فشل تحميل بيانات المحاضرة");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">
          المحاضرة غير موجودة
        </h2>
        <Link
          href="/schedule"
          className="text-emerald-600 hover:underline mt-4 inline-block"
        >
          العودة للجدول
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/schedule"
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-600"
        >
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">تعديل المحاضرة</h1>
          <p className="text-gray-500 text-sm mt-1">
            تعديل بيانات المحاضرة المسجلة
          </p>
        </div>
      </div>

      <SessionForm initialData={session} isEdit />
    </div>
  );
}
