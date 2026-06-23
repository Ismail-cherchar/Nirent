import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Truck, Lock } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ItemCard({ item }) {
  const photo = item.photos?.[0] || null;

  return (
    <Link to={createPageUrl(`ItemDetail?id=${item.id}`)} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
        {photo ? (
          <img
            src={photo}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {item.status === "rented" && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
            <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> En location
            </div>
          </div>
        )}
        {item.delivery_options === "delivery" || item.delivery_options === "both" ? (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-600 flex items-center gap-1">
            <Truck className="w-2.5 h-2.5" /> Livraison
          </div>
        ) : null}
      </div>
      <div className="mt-2.5 px-0.5">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3 h-3" />
            <span className="text-xs truncate max-w-[100px]">{item.location}</span>
          </div>
          {item.avg_rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-600">{item.avg_rating?.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}