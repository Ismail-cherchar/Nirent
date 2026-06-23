import React from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function NotificationBell({ count = 0 }) {
  return (
    <Link to={createPageUrl("Notifications")} className="relative p-2">
      <Bell className="w-5 h-5 text-white/80" />
      {count > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
