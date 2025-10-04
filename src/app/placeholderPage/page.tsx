"use client";

import React, { useEffect, useState } from "react";

interface UserClaims {
  name: string;
  role: string;
}

const decodeToken = (token: string): UserClaims | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return {
      name:
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        "مستخدم",
      role:
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || "غير معروف",
    } as UserClaims;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

const clientSideRedirect = (path: string) => {
  if (typeof window !== "undefined") {
    window.location.replace(path);
  }
};

export default function AttendanceDashboard() {
  const [user, setUser] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("Retrieved token:", token);

    if (!token) {
      clientSideRedirect("/login");
      return;
    }

    const claims = decodeToken(token);

    if (!claims || claims.role !== "Admin") {
      localStorage.removeItem("authToken");
      clientSideRedirect("/login");
      return;
    }

    setUser(claims);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    clientSideRedirect("/login");
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-indigo-600">
          جارٍ تحميل لوحة التحكم...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-12 lg:p-16" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-2xl">
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-indigo-700">
            مرحباً بك، أ.د. {user.name}
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-red-600 hover:text-red-800 transition duration-150"
          >
            تسجيل الخروج
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            هذه هي لوحة تحكم هيئة التدريس الخاصة بك. يمكنك من هنا البدء في تسجيل
            حضور الطلاب للمقررات التي تدرسها.
          </p>
          <p className="text-sm font-mono p-3 bg-indigo-50 text-indigo-800 rounded-lg inline-block">
            الدور الحالي: {user.role}
          </p>

          <h2 className="text-2xl font-bold text-gray-800 pt-4 border-t mt-6">
            ابدأ تسجيل الحضور
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            <button className="w-full md:w-1/2 bg-green-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-green-600 transition duration-300 transform hover:scale-[1.01]">
              <span className="text-xl">➕</span> فتح جلسة حضور جديدة
            </button>
            <button className="w-full md:w-1/2 bg-indigo-500 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-600 transition duration-300 transform hover:scale-[1.01]">
              عرض سجلات الحضور السابقة
            </button>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border-r-4 border-yellow-400 text-yellow-800 rounded-lg">
            <p className="font-medium">ملاحظة التوجيه:</p>
            <p className="text-sm">
              للتطبيق الحقيقي، يجب عليك استبدال الدالة الوهمية `decodeToken`
              بالدالة الفعلية من ملف `src/lib/auth.ts`.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
