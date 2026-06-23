import React from "react";
import { ShieldCheck, Star, Crown } from "lucide-react";

export function getUserBadges(user, reviewCount = 0, avgRating = 0) {
  const badges = [];
  const isVerified = user?.profile_photo && user?.bio && user?.phone && user?.location;
  if (isVerified) {
    badges.push({ key: "verified", label: "Profil vérifié", icon: ShieldCheck, color: "text-amber-600 bg-amber-50 border-amber-200" });
  }
  if (avgRating >= 4.5 && reviewCount >= 3) {
    badges.push({ key: "top", label: "Top loueur", icon: Star, color: "text-yellow-600 bg-yellow-50 border-yellow-200" });
  }
  badges.push({ key: "premium", label: "Premium (bientôt)", icon: Crown, color: "text-gray-400 bg-gray-50 border-gray-200 opacity-50" });
  return badges;
}

export default function UserBadges({ user, reviewCount = 0, avgRating = 0, size = "sm" }) {
  const badges = getUserBadges(user, reviewCount, avgRating);
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(({ key, label, icon: Icon, color }) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium ${color} ${textSize}`}
        >
          <Icon className={iconSize} />
          {label}
        </span>
      ))}
    </div>
  );
}