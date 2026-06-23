import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Heart, MapPin, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const favs = await base44.entities.Favorite.filter({ user_email: user.email }, "-created_date", 50);
      setFavorites(favs);
      setLoading(false);
    };
    load();
  }, []);

  const removeFavorite = async (favId) => {
    await base44.entities.Favorite.delete(favId);
    setFavorites(prev => prev.filter(f => f.id !== favId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Mes favoris</h1>
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-12 h-12 text-gray-200 mx-auto" />
            <p className="text-gray-400 mt-3 text-sm">Aucun favori enregistré</p>
            <Link to={createPageUrl("Search")} className="text-amber-600 text-sm font-medium mt-1 inline-block">
              Explorer les annonces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map(fav => (
              <div key={fav.id} className="relative group">
                <Link to={createPageUrl(`ItemDetail?id=${fav.item_id}`)} className="block bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    {fav.item_photo ? (
                      <img src={fav.item_photo} alt={fav.item_title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-amber-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{fav.item_title}</p>
                    {fav.item_location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {fav.item_location}
                      </p>
                    )}
                    {fav.item_price && (
                      <p className="text-sm font-bold text-amber-600 mt-1">€{fav.item_price}/jour</p>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}