"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThemeProvider } from "@/context/ThemeContext";
import AcademicYearSection from "@/components/settings/AcademicYearSection";
import GuidanceGroupSection from "@/components/settings/GuidanceGroupSection";
import RoomSection from "@/components/settings/RoomSection";
import SemesterSection from "@/components/settings/SemesterSection";
import CourseSection from "@/components/settings/courseSection";

export default function SettingsPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            الإعدادات العامة
          </h1>
        </div>

        {/* إدارة السنوات الدراسية */}
        <Card className="shadow-md dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle>إدارة السنوات الدراسية</CardTitle>
          </CardHeader>
          <CardContent>
            <AcademicYearSection />
          </CardContent>
        </Card>

        {/* إدارة مجموعات الإرشاد */}
        <Card className="shadow-md dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle>إدارة مجموعات الإرشاد</CardTitle>
          </CardHeader>
          <CardContent>
            <GuidanceGroupSection />
          </CardContent>
        </Card>

        {/* إدارة القاعات */}
        <Card className="shadow-md dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
          <CardHeader>
            <CardTitle>إدارة القاعات (Room)</CardTitle>
          </CardHeader>
          <CardContent>
            <RoomSection />
          </CardContent>
        </Card>

        {/*إدارة الفصل الدراسي*/}
        <Card className="shadow-md dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 mt-8">
          <CardHeader>
            <CardTitle>إدارة الفصل الدراسي</CardTitle>
          </CardHeader>
          <CardContent>
            <SemesterSection />
          </CardContent>
        </Card>
        {/*إدارة المقررات الدراسية*/}
        <Card className="shadow-md dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 mt-8">
          <CardHeader>
            <CardTitle>إدارة المقررات الدراسية</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseSection />
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}
