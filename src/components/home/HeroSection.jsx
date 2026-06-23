import React from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Map } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-700 pt-14 pb-20 px-5">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white" />
      </div>
      
      <div className="relative z-10 max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-white leading-tight">
          Louez n'importe quoi<br />à vos voisins
        </h1>
        <p className="text-amber-100 mt-3 text-sm leading-relaxed">
          Pourquoi acheter quand on peut louer ? Économisez et partagez avec votre communauté.
        </p>
        
        <Link
          to={createPageUrl("Search")}
          className="mt-6 flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-lg shadow-amber-900/20"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400 text-sm flex-1">Que cherchez-vous ?</span>
          <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </Link>

        <Link
          to={createPageUrl("MapView")}
          className="mt-3 flex items-center gap-2 text-amber-100 text-xs font-medium"
        >
          <Map className="w-4 h-4" />
          Voir les objets près de moi sur la carte
        </Link>
      </div>
    </div>
  );
}