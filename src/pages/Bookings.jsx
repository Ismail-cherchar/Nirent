import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Star, ShieldCheck, Truck, Handshake } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS = {
  pending:   "bg-amber-100 text-amber-700",
  accepted:  "bg-blue-100 text-blue-700",
  rejected:  "bg-red-100 text-red-700",
  active:    "bg-amber-100 text-amber-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS = {
  pending:   "En attente",
  accepted:  "Acceptée",
  rejected:  "Refusée",
  active:    "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

function BookingCard({ booking, isOwner, onAction, onReview, onExchange }) {
  const photo = booking.item_photo || "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=200&h=150&fit=crop";
  const isInPerson = booking.handover_mode === "in_person";
  const exchangeReady = booking.status === "active" && isInPerson && !booking.exchange_confirmed_renter;
  const returnReady = booking.status === "active" && isInPerson && booking.exchange_confirmed_renter && !booking.return_confirmed_renter;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex gap-3 p-3">
        <Link to={createPageUrl(`ItemDetail?id=${booking.item_id}`)} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <img src={photo} alt="" className="w-full h-full object-cover" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm truncate">{booking.item_title}</h3>
            <Badge className={`${STATUS_COLORS[booking.status]} text-[10px] rounded-full ml-2`}>
              {STATUS_LABELS[booking.status] || booking.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {isOwner ? `Locataire : ${booking.renter_name}` : `Propriétaire : ${booking.owner_name}`}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {format(new Date(booking.start_date), "d MMM")} – {format(new Date(booking.end_date), "d MMM")}
            </div>
            {booking.handover_mode && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                {booking.handover_mode === "in_person"
                  ? <><Handshake className="w-3 h-3" /><span>Main propre</span></>
                  : <><Truck className="w-3 h-3" /><span>Livraison</span></>}
              </span>
            )}
          </div>
          <p className="text-sm font-bold mt-1">€{booking.total_price?.toFixed(2)}</p>
        </div>
      </div>

      <div className="px-3 pb-3 flex gap-2 flex-wrap">
        {isOwner && booking.status === "pending" && (
          <>
            <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs h-8"
              onClick={() => onAction(booking.id, "accepted")}>Accepter</Button>
            <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs h-8"
              onClick={() => onAction(booking.id, "rejected")}>Refuser</Button>
          </>
        )}
        {isOwner && booking.status === "accepted" && (
          <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs h-8"
            onClick={() => onAction(booking.id, "active")}>Marquer en cours</Button>
        )}
        {isOwner && booking.status === "active" && !isInPerson && (
          <Button size="sm" className="flex-1 bg-gray-800 hover:bg-gray-900 rounded-xl text-xs h-8"
            onClick={() => onAction(booking.id, "completed")}>Terminer</Button>
        )}

        {/* Exchange security buttons */}
        {isInPerson && booking.status === "active" && (
          <>
            {!booking.exchange_confirmed_renter && (
              <Button size="sm"
                className="flex-1 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs h-8"
                onClick={() => onExchange(booking.id, "handover")}
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                Confirmer la remise
              </Button>
            )}
            {booking.exchange_confirmed_renter && !booking.return_confirmed_renter && (
              <Button size="sm"
                className="flex-1 bg-gray-700 hover:bg-gray-800 rounded-xl text-xs h-8"
                onClick={() => onExchange(booking.id, "return")}
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                Confirmer le retour
              </Button>
            )}
          </>
        )}

        {!isOwner && booking.status === "pending" && (
          <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs h-8 text-red-500 border-red-200"
            onClick={() => onAction(booking.id, "cancelled")}>Annuler</Button>
        )}
        {booking.status === "completed" && (
          <Button size="sm" variant="outline" className="flex-1 rounded-xl text-xs h-8"
            onClick={() => onReview(booking)}>
            <Star className="w-3 h-3 mr-1" /> Laisser un avis
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Bookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myRentals, setMyRentals] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const [rentals, listings] = await Promise.all([
      base44.entities.Booking.filter({ renter_email: u.email }, "-created_date", 50),
      base44.entities.Booking.filter({ owner_email: u.email }, "-created_date", 50),
    ]);
    setMyRentals(rentals);
    setMyListings(listings);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (bookingId, newStatus) => {
    await base44.entities.Booking.update(bookingId, { status: newStatus });
    // Notify the renter of status changes
    const booking = [...myRentals, ...myListings].find(b => b.id === bookingId);
    if (booking) {
      const notifMap = {
        accepted:  { title: "Réservation acceptée ✅", msg: `Votre demande pour « ${booking.item_title} » a été acceptée.`, to: booking.renter_email, type: "booking_accepted" },
        rejected:  { title: "Réservation refusée", msg: `Votre demande pour « ${booking.item_title} » a été refusée.`, to: booking.renter_email, type: "booking_rejected" },
        active:    { title: "Location en cours", msg: `La location de « ${booking.item_title} » est maintenant active.`, to: booking.renter_email, type: "booking_active" },
        completed: { title: "Location terminée", msg: `La location de « ${booking.item_title} » est terminée. Laissez un avis !`, to: booking.renter_email, type: "booking_completed" },
      };
      const n = notifMap[newStatus];
      if (n) {
        await base44.entities.Notification.create({
          user_email: n.to, title: n.title, message: n.msg, type: n.type, link: "/Bookings"
        });
      }
      // Update item status based on booking status
      if (newStatus === "accepted") {
        await base44.entities.Item.update(booking.item_id, { status: "rented" });
      } else if (newStatus === "completed" || newStatus === "rejected" || newStatus === "cancelled") {
        await base44.entities.Item.update(booking.item_id, { status: "active" });
      }

      // Send process guide message when booking is accepted
      if (newStatus === "accepted") {
        const emails = [booking.renter_email, booking.owner_email].sort();
        const convId = emails.join("_");
        const processMsg = `🎉 Votre réservation pour « ${booking.item_title} » a été acceptée !\n\nVoici le processus à suivre étape par étape :\n\n1️⃣ Effectuez le paiement du montant de la location\n2️⃣ Confirmez la réception de l'objet dans l'application\n3️⃣ Prenez une photo de l'objet lors de la réception (état initial)\n4️⃣ Utilisez l'objet pendant la période de location\n5️⃣ Rendez l'objet et prenez une photo pour confirmer le retour\n\n🔒 Caution : votre caution vous sera remboursée dans les 24h à 48h après le retour de l'objet, s'il n'y a aucun dommage constaté.\n\nBonne location ! 🚀`;
        await base44.entities.Message.create({
          conversation_id: convId,
          sender_email: booking.owner_email,
          sender_name: booking.owner_name,
          receiver_email: booking.renter_email,
          receiver_name: booking.renter_name,
          text: processMsg,
          item_id: booking.item_id,
          item_title: booking.item_title,
        });
      }
    }
    loadData();
  };

  const handleReview = (booking) => {
    navigate(createPageUrl(`Review?bookingId=${booking.id}&itemId=${booking.item_id}`));
  };

  const handleExchange = (bookingId, phase) => {
    navigate(createPageUrl(`Exchange?bookingId=${bookingId}&phase=${phase}`));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Réservations</h1>
        <Tabs defaultValue="rentals">
          <TabsList className="w-full bg-gray-100 rounded-xl h-10">
            <TabsTrigger value="rentals" className="flex-1 rounded-lg text-xs">Mes locations</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 rounded-lg text-xs">Demandes reçues</TabsTrigger>
          </TabsList>

          <TabsContent value="rentals" className="px-0 py-4 space-y-3">
            {loading ? (
              <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
            ) : myRentals.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-10 h-10 text-gray-200 mx-auto" />
                <p className="text-gray-400 text-sm mt-3">Aucune location pour l'instant</p>
              </div>
            ) : (
              myRentals.map(b => (
                <BookingCard key={b.id} booking={b} isOwner={false}
                  onAction={handleAction} onReview={handleReview} onExchange={handleExchange} />
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="px-0 py-4 space-y-3">
            {loading ? (
              <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-10 h-10 text-gray-200 mx-auto" />
                <p className="text-gray-400 text-sm mt-3">Aucune demande reçue</p>
              </div>
            ) : (
              myListings.map(b => (
                <BookingCard key={b.id} booking={b} isOwner={true}
                  onAction={handleAction} onReview={handleReview} onExchange={handleExchange} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}