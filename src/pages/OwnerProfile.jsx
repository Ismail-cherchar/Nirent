import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, MapPin, Star, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ItemCard from "../components/shared/ItemCard";
import StarRating from "../components/shared/StarRating";
import UserBadges from "../components/shared/UserBadges";

export default function OwnerProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const ownerEmail = urlParams.get("email");

  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [users, ownerItems, ownerReviews] = await Promise.all([
        base44.entities.User.filter({ email: ownerEmail }),
        base44.entities.Item.filter({ owner_email: ownerEmail, status: "active" }, "-created_date", 20),
        base44.entities.Review.filter({ reviewee_email: ownerEmail }, "-created_date", 20),
      ]);
      setOwner(users[0] || null);
      setItems(ownerItems);
      setReviews(ownerReviews);

      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) setCurrentUser(await base44.auth.me());
      setLoading(false);
    };
    load();
  }, [ownerEmail]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  const startConversation = () => {
    if (!currentUser) { base44.auth.redirectToLogin(); return; }
    const emails = [currentUser.email, ownerEmail].sort();
    const convId = emails.join("_");
    navigate(createPageUrl(`Chat?conversation=${convId}&with=${ownerEmail}&withName=${owner?.full_name || ownerEmail}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Skeleton className="h-48 w-full" />
        <div className="p-5 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="relative" style={{ background: "linear-gradient(135deg, #f9b816 0%, #e6a500 100%)" }}>
        <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 pb-0 flex items-center">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="pt-20 pb-20 px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold mx-auto overflow-hidden">
            {owner?.profile_photo
              ? <img src={owner.profile_photo} alt="" className="w-full h-full object-cover" />
              : (owner?.full_name?.[0]?.toUpperCase() || "?")}
          </div>
          <h1 className="text-xl font-bold text-white mt-3">{owner?.full_name || ownerEmail}</h1>
          {owner?.location && (
            <div className="flex items-center justify-center gap-1 text-white/80 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" /> {owner.location}
            </div>
          )}
          {avgRating > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="w-4 h-4 fill-white text-white" />
              <span className="text-white font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-white/70 text-sm">({reviews.length} avis)</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats + action */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold">{items.length}</p>
              <p className="text-[10px] text-gray-400">Annonces</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-lg font-bold">{reviews.length}</p>
              <p className="text-[10px] text-gray-400">Avis</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{avgRating > 0 ? avgRating.toFixed(1) : "–"}</p>
              <p className="text-[10px] text-gray-400">Note moy.</p>
            </div>
          </div>

          <UserBadges user={owner} reviewCount={reviews.length} avgRating={avgRating} />

          {currentUser?.email !== ownerEmail && (
            <Button
              onClick={startConversation}
              className="w-full mt-3 h-10 rounded-xl text-sm font-semibold"
              style={{ background: "#f9b816", color: "#1a1a1a" }}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Envoyer un message
            </Button>
          )}
        </div>
      </div>

      {/* Bio */}
      {owner?.bio && (
        <div className="px-5 mt-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-600">{owner.bio}</p>
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="font-bold text-gray-900 mb-3">Avis ({reviews.length})</h2>
          <div className="space-y-2">
            {reviews.slice(0, 5).map(r => (
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

      {/* Items */}
      {items.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="font-bold text-gray-900 mb-3">Objets proposés ({items.length})</h2>
          <div className="grid grid-cols-2 gap-3">
            {items.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </div>
      )}
    </div>
  );
}