"use client";

import React, { useEffect, useState } from "react";
import { decodeJwt } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { fetchStudentById } from "@/actions/Student/fetchStudentById";

import { Student } from "@/actions/Student/types";

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token found");
        }

        const claims = decodeJwt(token);
        if (!claims || !claims.id) {
          throw new Error("Invalid token or missing student ID");
        }

        const data = await fetchStudentById(claims.id);
        setStudent(data);
        localStorage.setItem("student_data_cache", JSON.stringify(data));
      } catch (err: any) {
        console.error("Error fetching student data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

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

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <p>No student data found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">بيانات الطالب</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="col-span-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">البيانات الشخصية</h2>
          </div>
          <InfoCard label="الاسم" value={student.user.name} />
          <InfoCard label="الرقم القومي" value={student.user.nationalNo} />
          <InfoCard label="البريد الإلكتروني" value={student.user.email} />
          <InfoCard label="رقم الهاتف" value={student.user.phone} />
          <InfoCard label="رقم ولي الأمر" value={student.parentPhone} />
          <InfoCard label="العنوان" value={student.address} />

          {/* Academic Information */}
          <div className="col-span-full mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">البيانات الأكاديمية</h2>
          </div>
          <InfoCard label="رقم الجلوس (الكود)" value={student.sittingNumber} />
          <InfoCard label="المستوى" value={student.studentLevel} />
          <InfoCard label="تاريخ الالتحاق" value={student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('ar-EG') : "-"} />
          <InfoCard label="المعدل التراكمي (GPA)" value={student.gpa} />
          <InfoCard label="مجموع الدرجات" value={student.totalGrades} />
          <InfoCard label="ملاحظات" value={student.notes} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value || "-"}</p>
    </div>
  );
}
