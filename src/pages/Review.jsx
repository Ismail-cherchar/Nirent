import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import StarRating from "../components/shared/StarRating";

export default function Review() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("bookingId");
  const itemId = urlParams.get("itemId");

  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      if (bookings.length > 0) setBooking(bookings[0]);
    };
    load();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    const isRenter = user.email === booking.renter_email;
    await base44.entities.Review.create({
      booking_id: bookingId,
      item_id: itemId,
      reviewer_email: user.email,
      reviewer_name: user.full_name,
      reviewee_email: isRenter ? booking.owner_email : booking.renter_email,
      rating,
      comment,
      type: isRenter ? "renter_to_owner" : "owner_to_renter",
    });
    await base44.entities.Booking.update(bookingId, {
      [isRenter ? "renter_reviewed" : "owner_reviewed"]: true,
    });
    setLoading(false);
    navigate(createPageUrl("Bookings"));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold">Laisser un avis</h1>
      </div>

      <div className="px-5 py-8 space-y-6">
        {booking && (
          <div className="text-center">
            <p className="text-sm text-gray-400">Comment s'est passée votre expérience avec</p>
            <p className="font-bold text-lg mt-1">
              {user?.email === booking.renter_email ? booking.owner_name : booking.renter_name}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">{booking.item_title}</p>
          </div>
        )}

        <div className="flex justify-center">
          <StarRating rating={rating} size="lg" interactive onRate={setRating} />
        </div>

        {rating > 0 && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              {["", "Très déçu", "Déçu", "Correct", "Bien", "Excellent !"][rating]}
            </p>
          </div>
        )}

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience en quelques mots..."
          className="rounded-xl h-32"
        />

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-base font-semibold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publier l'avis"}
        </Button>
      </div>
    </div>
  );
}