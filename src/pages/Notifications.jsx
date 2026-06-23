import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Bell, Calendar, MessageCircle, Star, ShieldCheck, Package, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const TYPE_CONFIG = {
  booking_request:   { icon: Calendar,      color: "text-amber-600 bg-amber-50" },
  booking_accepted:  { icon: CheckCheck,    color: "text-green-600 bg-green-50" },
  booking_rejected:  { icon: Calendar,      color: "text-red-500 bg-red-50" },
  booking_active:    { icon: Package,       color: "text-blue-600 bg-blue-50" },
  booking_completed: { icon: CheckCheck,    color: "text-gray-600 bg-gray-50" },
  message:           { icon: MessageCircle, color: "text-amber-600 bg-amber-50" },
  review:            { icon: Star,          color: "text-yellow-500 bg-yellow-50" },
  exchange:          { icon: ShieldCheck,   color: "text-amber-600 bg-amber-50" },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      const notifs = await base44.entities.Notification.filter(
        { user_email: u.email },
        "-created_date",
        50
      );
      setNotifications(notifs);
      setLoading(false);
      // Mark all as read
      const unread = notifs.filter(n => !n.read);
      for (const n of unread) {
        base44.entities.Notification.update(n.id, { read: true });
      }
    };
    load();
  }, []);

  const handleClick = (notif) => {
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 pt-14">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold flex-1">Notifications</h1>
      </div>

      {loading ? (
        <div className="p-5 space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-5">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm">Aucune notification</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.message;
            const Icon = config.icon;
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full flex items-start gap-3 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left ${
                  !notif.read ? "border-l-4 border-[#f9b816]" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${!notif.read ? "text-gray-900" : "text-gray-700"}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-gray-300 mt-1">
                    {format(new Date(notif.created_date), "d MMM à HH:mm")}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2" style={{ background: "#f9b816" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}