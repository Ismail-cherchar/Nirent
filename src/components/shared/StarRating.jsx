import React from "react";
import { Star } from "lucide-react";

export default function StarRating({ rating = 0, count, size = "sm", interactive = false, onRate }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`${sizes[size]} ${
                star <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-400 ml-0.5">({count})</span>
      )}
    </div>
  );
}