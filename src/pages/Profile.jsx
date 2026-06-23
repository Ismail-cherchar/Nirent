import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings, LogOut, Package, Calendar, TrendingUp, MapPin,
  ChevronRight, Star, ShieldCheck, Map, Heart
} from "lucide-react";
import ItemCard from "../components/shared/ItemCard";
import StarRating from "../components/shared/StarRating";
import UserBadges from "../components/shared/UserBadges";
import NotificationBell from "../components/layout/NotificationBell";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookingStats, setBookingStats] = useState({ active: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [myItems, myReviews, myBookings] = await Promise.all([
        base44.entities.Item.filter({ owner_email: u.email }, "-created_date", 20),
        base44.entities.Review.filter({ reviewee_email: u.email }, "-created_date", 10),
        base44.entities.Booking.filter({ owner_email: u.email }, "-created_date", 50),
      ]);
      setItems(myItems);
      setReviews(myReviews);
      setBookingStats({
        active: myBookings.filter(b => b.status === "active").length,
        completed: myBookings.filter(b => b.status === "completed").length,
        pending: myBookings.filter(b => b.status === "pending").length,
      });
      setLoading(false);
    };
    load();
  }, []);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-5 pt-14 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div><Skeleton className="h-5 w-32" /><Skeleton className="h-3 w-24 mt-2" /></div>
        </div>
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-700 pt-14 pb-24 px-5">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-white">Mon profil</h1>
        <div className="flex gap-1 items-center">
          <NotificationBell count={0} />
          {user?.role === "admin" && (
            <Link to={createPageUrl("AdminPanel")} className="p-2 bg-white/10 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-white" />
            </Link>
          )}
          <Link to={createPageUrl("MapView")} className="p-2 bg-white/10 rounded-xl">
            <Map className="w-4 h-4 text-white" />
          </Link>
          <Link to={createPageUrl("EditProfile")} className="p-2 bg-white/10 rounded-xl">
            <Settings className="w-4 h-4 text-white" />
          </Link>
        </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white/30 overflow-hidden">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.full_name?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {user?.location && (
                <span className="text-amber-200 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {user.location}
                </span>
              )}
              {avgRating > 0 && (
                <span className="text-amber-200 text-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-200" /> {avgRating.toFixed(1)}
                </span>
              )}
            </div>
            <div className="mt-2">
              <UserBadges user={user} reviewCount={reviews.length} avgRating={avgRating} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-lg font-bold">{items.length}</p>
            <p className="text-[10px] text-gray-400">Annonces</p>
          </div>
          <div className="text-center">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-lg font-bold">{bookingStats.active}</p>
            <p className="text-[10px] text-gray-400">En cours</p>
          </div>
          <div className="text-center">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-lg font-bold">{bookingStats.completed}</p>
            <p className="text-[10px] text-gray-400">Terminées</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user?.bio && (
        <div className="px-5 mt-4">
          <div className="bg-white rounded-xl border border-gray-100 p-3">
            <p className="text-sm text-gray-600">{user.bio}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-5 mt-4 space-y-2">
        <Link
          to={createPageUrl("Favorites")}
          className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3.5"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-rose-400" />
            <span className="text-sm font-medium">Mes favoris</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>

        <Link
          to={createPageUrl("Bookings")}
          className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3.5"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium">Mes réservations</span>
            {bookingStats.pending > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px] rounded-full">{bookingStats.pending} en attente</Badge>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>

        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3.5 w-full text-left"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-sm font-medium text-red-500">Se déconnecter</span>
        </button>
      </div>

      {/* My Listings */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Mes annonces</h3>
          <Link to={createPageUrl("AddItem")} className="text-amber-600 text-sm font-medium">
            + Ajouter
          </Link>
        </div>
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <Package className="w-8 h-8 text-gray-200 mx-auto" />
            <p className="text-gray-400 text-sm mt-2">Aucune annonce publiée</p>
            <Link to={createPageUrl("AddItem")} className="text-amber-600 text-sm font-medium mt-1 inline-block">
              Publier votre premier objet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="px-5 mt-6">
          <h3 className="font-bold text-gray-900 mb-3">Avis reçus ({reviews.length})</h3>
          <div className="space-y-2">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.reviewer_name}</span>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                {r.comment && <p className="text-xs text-gray-500 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}