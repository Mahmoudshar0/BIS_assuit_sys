"use client";

import React, { useEffect, useState } from "react";
import { decodeJwt } from "@/lib/auth";
import { Loader2, Bell, CheckCircle, AlertCircle } from "lucide-react";
import { fetchNotificationsByUser } from "@/actions/Notification/fetchNotificationsByUser";
import { Notification } from "@/actions/Notification/types";

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token found");
        }

        const claims = decodeJwt(token);
        if (!claims || !claims.id) {
          throw new Error("Invalid token or missing user ID");
        }

        const data = await fetchNotificationsByUser(claims.id);
        setNotifications(data);
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                  notification.seen
                    ? "bg-white border-gray-100"
                    : "bg-emerald-50 border-emerald-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    notification.seen ? "bg-gray-100 text-gray-500" : "bg-emerald-100 text-emerald-600"
                  }`}>
                    {notification.seen ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-1">{notification.message}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{notification.type}</span>
                      <span>•</span>
                      <span dir="ltr">
                        {new Date(notification.createdAt).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
