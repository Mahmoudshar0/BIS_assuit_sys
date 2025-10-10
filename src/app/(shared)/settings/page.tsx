"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThemeProvider } from "@/context/ThemeContext";
import AcademicYearSection from "@/components/settings/AcademicYearSection";
import GuidanceGroupSection from "@/components/settings/GuidanceGroupSection";

export default function SettingsPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            الإعدادات العامة
          </h1>
        </div>

        <Card className="shadow-md dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle>إدارة السنوات الدراسية</CardTitle>
          </CardHeader>
          <CardContent>
            <AcademicYearSection />
          </CardContent>
        </Card>

        <Card className="shadow-md dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
          <CardHeader>
            <CardTitle>إدارة مجموعات الإرشاد</CardTitle>
          </CardHeader>
          <CardContent>
            <GuidanceGroupSection />
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}
