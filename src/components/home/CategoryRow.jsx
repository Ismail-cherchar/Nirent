import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CategoryIcon, { getAllCategories } from "../shared/CategoryIcon";

export default function CategoryRow() {
  const categories = getAllCategories();

  return (
    <div className="px-5 -mt-8 relative z-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex overflow-x-auto gap-4 pb-1 no-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={createPageUrl(`Search?category=${cat.value}`)}
              className="flex flex-col items-center gap-1.5 min-w-[60px] group"
            >
              <CategoryIcon category={cat.value} size="md" />
              <span className="text-[10px] font-medium text-gray-500 group-hover:text-emerald-600 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}