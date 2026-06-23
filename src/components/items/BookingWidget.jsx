import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { CalendarDays, Loader2, Shield, Handshake, Truck, ChevronRight } from "lucide-react";

export default function BookingWidget({ item, currentUser }) {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [handoverMode, setHandoverMode] = useState(null);
  const [step, setStep] = useState(1); // 1: dates, 2: handover mode
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isOwner = currentUser?.email === item.owner_email;
  const days = startDate && endDate ? Math.max(differenceInDays(endDate, startDate), 1) : 0;
  const totalPrice = days * (item.price_per_day || 0);

  const handleBook = async () => {
    if (!currentUser) { base44.auth.redirectToLogin(); return; }
    setLoading(true);
    await base44.entities.Booking.create({
      item_id: item.id,
      item_title: item.title,
      item_photo: item.photos?.[0] || "",
      renter_email: currentUser.email,
      renter_name: currentUser.full_name,
      owner_email: item.owner_email,
      owner_name: item.owner_name,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      total_price: totalPrice,
      deposit_amount: item.deposit_amount || 0,
      status: "pending",
      payment_status: "pending",
      handover_mode: handoverMode,
    });
    // Notify the owner
    await base44.entities.Notification.create({
      user_email: item.owner_email,
      title: "Nouvelle demande de réservation",
      message: `${currentUser.full_name} souhaite louer votre objet « ${item.title} »`,
      type: "booking_request",
      link: "/Bookings",
    });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate(createPageUrl("Bookings")), 1500);
  };

  if (success) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-amber-600" />
        </div>
        <p className="font-semibold text-amber-800">Demande envoyée !</p>
        <p className="text-sm text-amber-600 mt-1">Le propriétaire va examiner votre demande.</p>
      </div>
    );
  }

  if (item.status === "rented") {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-orange-500" />
        </div>
        <p className="font-semibold text-orange-800">Objet en cours de location</p>
        <p className="text-sm text-orange-600 mt-1">Cet objet n'est pas disponible pour le moment. Revenez plus tard !</p>
      </div>
    );
  }

  // Handover options based on item's delivery_options
  const handoverOptions = [];
  if (item.delivery_options !== "delivery") handoverOptions.push({ value: "in_person", label: "Main propre", icon: Handshake, desc: "Récupération en personne" });
  if (item.delivery_options !== "pickup") handoverOptions.push({ value: "delivery", label: "Livraison", icon: Truck, desc: "Livraison à domicile" });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">€{item.price_per_day}</span>
        <span className="text-gray-400 text-sm">/ jour</span>
      </div>

      {!isOwner && (
        <>
          {/* Step 1: Dates */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-xl h-11 justify-start text-sm">
                      <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                      {startDate ? format(startDate, "d MMM") : "Début"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(d) => { setStartDate(d); if (endDate && d > endDate) setEndDate(null); }}
                      disabled={(d) => d < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-xl h-11 justify-start text-sm">
                      <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                      {endDate ? format(endDate, "d MMM") : "Fin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(d) => d < (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {days > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">€{item.price_per_day} × {days} jour{days > 1 ? "s" : ""}</span>
                    <span className="font-medium">€{totalPrice.toFixed(2)}</span>
                  </div>
                  {item.deposit_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Caution remboursable</span>
                      <span className="font-medium">€{item.deposit_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>€{(totalPrice + (item.deposit_amount || 0)).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={!startDate || !endDate}
                className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base"
              >
                Continuer <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}

          {/* Step 2: Handover mode */}
          {step === 2 && (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Mode de remise</p>
                <div className="space-y-2">
                  {handoverOptions.map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      onClick={() => setHandoverMode(value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                        handoverMode === value
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        handoverMode === value ? "bg-amber-100" : "bg-gray-100"
                      }`}>
                        <Icon className={`w-4 h-4 ${handoverMode === value ? "text-amber-600" : "text-gray-400"}`} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium ${handoverMode === value ? "text-amber-800" : "text-gray-700"}`}>
                          {label}
                        </p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl h-11">
                  Retour
                </Button>
                <Button
                  onClick={handleBook}
                  disabled={!handoverMode || loading}
                  className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Réserver"}
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {isOwner && (
        <div className="flex gap-2 pt-1">
          <a href={`#/AddItem?edit=${item.id}`} className="flex-1 text-center text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2.5 transition-colors">✏️ Modifier</a>
        </div>
      )}
    </div>
  );
}