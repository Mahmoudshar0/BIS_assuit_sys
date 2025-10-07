"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  LogOut,
  ChevronDown,
} from "lucide-react";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

interface Tab {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: Tab[];
}

export default function SharedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isUsersOpen, setIsUsersOpen] = useState(pathname.startsWith("/users"));

  const tabs: Tab[] = [
    { href: "/overview", label: "نظرة عامة", icon: LayoutDashboard },
    {
      href: "/users",
      label: "إدارة المستخدمين",
      icon: Users,
      children: [
        { href: "/users/students", label: "الطلاب", icon: Users },
        { href: "/users/instructors", label: "المحاضرون", icon: Users },
        { href: "/users/employees", label: "الموظفون", icon: Users },
        { href: "/users/managers", label: "أعضاء الإدارة", icon: Users },
      ],
    },
    { href: "/reports", label: "التقارير", icon: BarChart3 },
    { href: "/settings", label: "الإعدادات", icon: Settings },
  ];

  const isActive = (href: string) =>
    pathname === href || (pathname.startsWith(href) && href !== "/");

  const clientSideRedirect = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.replace(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    clientSideRedirect("/");
  };

  return (
    <div
      className="flex min-h-screen bg-gradient-to-tr from-slate-100 to-sky-50"
      dir="rtl"
    >
      <motion.aside
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white/90 backdrop-blur-md text-slate-800 flex flex-col justify-between shadow-2xl border-l border-slate-200 fixed top-0 right-0 h-full z-10"
      >
        <div>
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold mb-1 text-sky-700">
              لوحة التحكم
            </h1>
          </div>

          <nav className="flex flex-col gap-2 p-4">
            {tabs.map((tab) => (
              <React.Fragment key={tab.href}>
                {tab.children ? (
                  <div key={tab.href} className="flex flex-col">
                    <button
                      onClick={() => setIsUsersOpen(!isUsersOpen)}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-right font-medium transition-all duration-300 hover:bg-sky-100 hover:text-sky-700 w-full ${
                        isUsersOpen
                          ? "bg-sky-50 text-sky-600"
                          : "text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon size={20} />
                        {tab.label}
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${
                          isUsersOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isUsersOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-1 pr-8 py-1 overflow-hidden"
                      >
                        {tab.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              isActive(child.href)
                                ? "bg-sky-200 text-sky-800 font-semibold"
                                : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-right font-medium transition-all duration-300 ${
                      isActive(tab.href)
                        ? "bg-sky-50 text-sky-600"
                        : "hover:bg-sky-100 hover:text-sky-700 text-slate-800"
                    }`}
                  >
                    <tab.icon size={20} />
                    {tab.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 mx-4 mb-5 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </motion.aside>

      <main className="flex-1 p-10 bg-white rounded-s-3xl shadow-inner m-4 mr-72">
        {children}
      </main>
    </div>
  );
}
