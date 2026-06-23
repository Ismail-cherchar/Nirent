import React from "react";
import { Wrench, Tent, Dumbbell, PartyPopper, Laptop, TreePine, UtensilsCrossed, Sofa, Car, Package } from "lucide-react";

const CATEGORY_MAP = {
  tools:       { icon: Wrench,          color: "bg-blue-50 text-blue-600",    label: "Outils" },
  camping:     { icon: Tent,            color: "bg-green-50 text-green-600",  label: "Camping" },
  sports:      { icon: Dumbbell,        color: "bg-orange-50 text-orange-600",label: "Sports" },
  party:       { icon: PartyPopper,     color: "bg-pink-50 text-pink-600",    label: "Fête" },
  electronics: { icon: Laptop,          color: "bg-purple-50 text-purple-600",label: "Électronique" },
  garden:      { icon: TreePine,        color: "bg-emerald-50 text-emerald-600", label: "Jardin" },
  kitchen:     { icon: UtensilsCrossed, color: "bg-amber-50 text-amber-600",  label: "Cuisine" },
  furniture:   { icon: Sofa,            color: "bg-indigo-50 text-indigo-600",label: "Mobilier" },
  vehicles:    { icon: Car,             color: "bg-red-50 text-red-600",      label: "Véhicules" },
  other:       { icon: Package,         color: "bg-gray-50 text-gray-600",    label: "Autre" },
};

export function getCategoryInfo(category) {
  return CATEGORY_MAP[category] || CATEGORY_MAP.other;
}

export function getAllCategories() {
  return Object.entries(CATEGORY_MAP).map(([key, val]) => ({
    value: key,
    ...val,
  }));
}

export default function CategoryIcon({ category, size = "md" }) {
  const info = getCategoryInfo(category);
  const Icon = info.icon;
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14" };
  const iconSizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };

  return (
    <div className={`${sizes[size]} rounded-xl ${info.color} flex items-center justify-center`}>
      <Icon className={iconSizes[size]} />
    </div>
  );
}