import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, MapPin, Share2, Heart, MessageCircle, Shield, Clock, Star, Pencil, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ImageCarousel from "../components/items/ImageCarousel";
import BookingWidget from "../components/items/BookingWidget";
import StarRating from "../components/shared/StarRating";
import CategoryIcon, { getCategoryInfo } from "../components/shared/CategoryIcon";

export default function ItemDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [items, revs] = await Promise.all([
        base44.entities.Item.filter({ id: itemId }),
        base44.entities.Review.filter({ item_id: itemId }),
      ]);
      setItem(items[0] || null);
      setReviews(revs);

      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const u = await base44.auth.me();
        setCurrentUser(u);
        const favs = await base44.entities.Favorite.filter({ user_email: u.email, item_id: itemId });
        if (favs.length > 0) { setIsFavorite(true); setFavoriteId(favs[0].id); }
      }
      setLoading(false);
    };
    load();
  }, [itemId]);

  const toggleFavorite = async () => {
    if (!currentUser) { base44.auth.redirectToLogin(); return; }
    setFavLoading(true);
    if (isFavorite) {
      await base44.entities.Favorite.delete(favoriteId);
      setIsFavorite(false); setFavoriteId(null);
    } else {
      const fav = await base44.entities.Favorite.create({
        user_email: currentUser.email,
        item_id: item.id,
        item_title: item.title,
        item_photo: item.photos?.[0] || null,
        item_price: item.price_per_day,
        item_location: item.location,
      });
      setIsFavorite(true); setFavoriteId(fav.id);
    }
    setFavLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette annonce définitivement ?")) return;
    setDeleting(true);
    await base44.entities.Item.update(item.id, { status: "deleted" });
    navigate(-1);
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#/ItemDetail?id=${item.id}`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: `Loue cet objet sur Nirent : ${item.title}`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const startConversation = () => {
    if (!currentUser) { base44.auth.redirectToLogin(); return; }
    const emails = [currentUser.email, item.owner_email].sort();
    const convId = emails.join("_");
    navigate(createPageUrl(`Chat?conversation=${convId}&with=${item.owner_email}&withName=${item.owner_name}&itemId=${item.id}&itemTitle=${item.title}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="p-5 space-y-4">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">Item not found</p>
      </div>
    );
  }

  const catInfo = getCategoryInfo(item.category);

  return (
    <div className="min-h-screen bg-white pb-6">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-2">
          {currentUser?.email === item?.owner_email && (
            <>
              <a href={`#/AddItem?edit=${item.id}`} className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <Pencil className="w-4 h-4" />
              </a>
              <button onClick={handleDelete} disabled={deleting} className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </>
          )}
          <button onClick={handleShare} className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={toggleFavorite} disabled={favLoading} className="w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      <ImageCarousel images={item.photos} />

      <div className="px-5 py-5 space-y-5">
        {/* Title & Category */}
        <div>
          {item.status === "rented" && (
          <div className="mb-2 inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
            <Lock className="w-3 h-3" /> En cours de location
          </div>
        )}
        <Badge className={`${catInfo.color} mb-2 text-xs rounded-full`}>
          {catInfo.label}
        </Badge>
        <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm">{item.location}</span>
          </div>
          {item.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{item.avg_rating?.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({item.review_count})</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking */}
        <BookingWidget item={item} currentUser={currentUser} />

        {/* Owner */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <Link to={createPageUrl(`OwnerProfile?email=${item.owner_email}`)} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0" style={{ background: '#f9b816' }}>
              {item.owner_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{item.owner_name}</p>
              <p className="text-xs text-gray-400">Voir le profil →</p>
            </div>
          </Link>
          {currentUser?.email !== item.owner_email && (
            <Button
              variant="outline"
              size="sm"
              onClick={startConversation}
              className="w-full rounded-xl"
            >
              <MessageCircle className="w-4 h-4 mr-1" /> Envoyer un message
            </Button>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          {item.deposit_amount > 0 && (
            <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-blue-400">Caution</p>
                <p className="text-sm font-semibold text-blue-700">€{item.deposit_amount}</p>
              </div>
            </div>
          )}
          <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-xs text-amber-400">Prix</p>
                    <p className="text-sm font-semibold text-amber-700">€{item.price_per_day}/jour</p>
            </div>
          </div>
        </div>

        {/* Rules */}
        {item.rules && (
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Règles & Conditions</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.rules}</p>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Avis ({reviews.length})</h3>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{review.reviewer_name}</span>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  {review.comment && <p className="text-sm text-gray-500">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}