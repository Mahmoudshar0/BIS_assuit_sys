"use client";

// اولا فلتره الكورسات ع حسب الليفل
// ثانيا فلتره  تانيه حسب جروبات الارشاد و دي تتبعت مع الداتا وهي رايحه
// تعديل اكشن التعديل
// تعديل اكشن الحذف
import SessionForm from "@/components/schedule/SessionForm";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CreateSessionPage() {
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
          <h1 className="text-2xl font-bold text-gray-200">إضافة محاضرة جديدة</h1>
          <p className="text-gray-400 text-sm mt-1">
            أدخل بيانات المحاضرة لإضافتها إلى الجدول
          </p>
        </div>
      </div>

      <SessionForm />
    </div>
  );
}
