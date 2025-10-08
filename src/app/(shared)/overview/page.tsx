"use client";

export default function OverviewPage() {
  return (
    <div dir="rtl">
      <h1 className="text-3xl font-extrabold text-sky-800 mb-6">
        نظرة عامة على النظام
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-r-4 border-indigo-500">
          <p className="text-sm text-gray-500">إجمالي الطلاب</p>
          <p className="text-4xl font-bold text-indigo-700 mt-1">4,210</p>
          <p className="text-xs text-green-500 mt-2">
            زيادة 5% عن الشهر الماضي
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-r-4 border-sky-500">
          <p className="text-sm text-gray-500">المقررات النشطة</p>
          <p className="text-4xl font-bold text-sky-700 mt-1">45</p>
          <p className="text-xs text-yellow-500 mt-2">3 مقررات تحتاج تحديث</p>
        </div>

        {/* بطاقة إحصائية 3: المحاضرون */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-r-4 border-emerald-500">
          <p className="text-sm text-gray-500">المحاضرون</p>
          <p className="text-4xl font-bold text-emerald-700 mt-1">88</p>
          <p className="text-xs text-gray-500 mt-2">مسجلون في النظام</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-700 mb-4">أنشطة حديثة</h2>
        <ul className="space-y-3 text-gray-600">
          <li>
            تمت إضافة طالب جديد (ID: 5543) بواسطة الإدارة.{" "}
            <span className="text-xs text-gray-400 mr-2">منذ دقيقة</span>
          </li>
          <li>
            تم تحديث بيانات مقرر الذكاء الاصطناعي.{" "}
            <span className="text-xs text-gray-400 mr-2">منذ 15 دقيقة</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
