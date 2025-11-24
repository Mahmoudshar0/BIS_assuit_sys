"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);

    try {
      const userClaims = await login({ email, password });
      console.log("Login Successful, User Role:", userClaims.role);

      switch (userClaims.role) {
        case "Admin":
          router.push("/overview");
          break;
        case "Faculty":
          router.push("/attendance");
          break;
        case "Student":
          router.push("/student/records");
          break;
        default:
          router.push("/");
      }
    } catch (err: unknown) {
      let errorMessage = "فشل في الاتصال، حاول مرة أخرى.";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError("خطأ: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6 mt-6" onSubmit={handleSubmit} dir="rtl">
      {error && (
        <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg text-center animate-pulse">
          {error}
        </div>
      )}

      <div className="group">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          البريد الإلكتروني الجامعي
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@staff.uni.edu.eg"
          className="text-black block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md"
        />
      </div>

      <div className="group">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="text-black block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:shadow-md"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all duration-300 
         ${
           loading
             ? "bg-green-400 cursor-not-allowed"
             : "bg-green-600 hover:bg-green-700 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
         }`}
      >
        {loading ? (
          <span className="animate-pulse">جارٍ تسجيل الدخول...</span>
        ) : (
          "تسجيل الدخول"
        )}
      </button>
    </form>
  );
}
