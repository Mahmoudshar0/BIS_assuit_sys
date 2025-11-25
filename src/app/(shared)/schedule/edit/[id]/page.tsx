"use client";

import { useEffect, useState, use } from "react";
import SessionForm from "@/components/schedule/SessionForm";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchSessionById } from "@/actions/Schedule/scheduleActions";
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
        const sessionData = await fetchSessionById(Number(id));
        setSession(sessionData);
      } catch (error) {
        console.error("Failed to load session:", error);
        toast.error("فشل تحميل بيانات المحاضرة");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id]);
  console.log(session);
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
