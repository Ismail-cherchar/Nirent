import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import ItemCard from "../shared/ItemCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function NearbyItems({ items, isLoading }) {
  return (
    <div className="px-5 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Objets disponibles</h2>
        <Link
          to={createPageUrl("Search")}
          className="flex items-center gap-1 text-amber-600 text-sm font-medium"
        >
          Voir tout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/3] rounded-2xl" />
              <Skeleton className="h-4 w-3/4 mt-2.5" />
              <Skeleton className="h-3 w-1/2 mt-1.5" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Aucun objet disponible pour l'instant.</p>
          <Link to={createPageUrl("AddItem")} className="text-amber-600 text-sm font-medium mt-1 inline-block">
            Soyez le premier à publier !
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}