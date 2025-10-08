"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import React, { useState, useEffect } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 980);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div className="flex min-h-screen relative" dir="rtl">
      {isMobile && (
        <button
          className="fixed top-4 right-4 z-30 bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-lg shadow-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={22} />
        </button>
      )}

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <motion.aside
        initial={{ x: isMobile ? 300 : 0 }}
        animate={{ x: isMobile && !isSidebarOpen ? 300 : 0 }}
        transition={{ duration: 0.4 }}
        className={`w-64 bg-white/90 backdrop-blur-md text-slate-800 flex flex-col justify-between shadow-2xl border-l border-slate-200 fixed top-0 right-0 h-full z-30 ${
          isMobile ? "rounded-l-2xl" : ""
        }`}
      >
        <div>
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-500 to-blue-500 text-white flex justify-between items-center rounded-tl-2xl">
            <div className="flex items-center gap-3">
              <img
                src="/faculty-logo.png"
                alt="Logo"
                className="w-10 h-10 rounded-full shadow-md border border-white/50"
              />
              <h1 className="text-2xl font-bold tracking-wide">لوحة التحكم</h1>
            </div>

            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-white/80 hover:text-white transition"
              >
                <X size={22} />
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-2 p-4">
            {tabs.map((tab) => (
              <React.Fragment key={tab.href}>
                {tab.children ? (
                  <div key={tab.href} className="flex flex-col">
                    <button
                      onClick={() => setIsUsersOpen(!isUsersOpen)}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-right font-medium transition-all duration-300 hover:bg-green-50 hover:text-blue-700 w-full ${
                        isUsersOpen
                          ? "bg-green-100 text-blue-700"
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
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                              isActive(child.href)
                                ? "bg-green-200 text-blue-900 font-semibold"
                                : "text-slate-600 hover:bg-green-50 hover:text-blue-700"
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
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-right font-medium transition-all duration-300 ${
                      isActive(tab.href)
                        ? "bg-green-100 text-blue-700"
                        : "hover:bg-green-50 hover:text-blue-700 text-slate-800"
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

      <main
        className={`flex-1 p-8 rounded-s-3xl shadow-inner m-2 transition-all duration-300 ${
          isMobile ? "mr-0" : "mr-72"
        } bg-white/70 backdrop-blur-sm`}
        style={{
          backgroundImage: `url('/cover2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {children}
      </main>
    </div>
  );
}
