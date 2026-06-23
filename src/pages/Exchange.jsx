import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ShieldCheck, Key, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function Exchange() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("bookingId");
  const phase = urlParams.get("phase") || "handover"; // "handover" or "return"

  const [booking, setBooking] = useState(null);
  const [user, setUser] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isHandover = phase === "handover";
  const codeField = isHandover ? "exchange_code" : "return_code";
  const confirmedOwnerField = isHandover ? "exchange_confirmed_owner" : "return_confirmed_owner";
  const confirmedRenterField = isHandover ? "exchange_confirmed_renter" : "return_confirmed_renter";

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      if (bookings.length > 0) setBooking(bookings[0]);
    };
    load();
  }, [bookingId]);

  const isOwner = user?.email === booking?.owner_email;

  const generateAndSaveCode = async () => {
    setLoading(true);
    const code = generateCode();
    await base44.entities.Booking.update(bookingId, {
      [codeField]: code,
      [confirmedOwnerField]: true,
    });
    setBooking(prev => ({ ...prev, [codeField]: code, [confirmedOwnerField]: true }));
    setLoading(false);
  };

  const confirmWithCode = async () => {
    setError("");
    if (codeInput !== booking[codeField]) {
      setError("Code incorrect. Vérifiez avec le propriétaire.");
      return;
    }
    setLoading(true);
    const updates = { [confirmedRenterField]: true };
    // If return phase is fully confirmed, complete the booking
    if (!isHandover) {
      updates.status = "completed";
    }
    await base44.entities.Booking.update(bookingId, updates);
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate(createPageUrl("Bookings")), 2000);
  };

  if (!booking || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {isHandover ? "Remise confirmée !" : "Retour confirmé !"}
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          {isHandover ? "L'échange a bien été validé." : "La location est maintenant terminée."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold">
          {isHandover ? "Confirmer la remise" : "Confirmer le retour"}
        </h1>
      </div>

      <div className="px-5 py-8 space-y-6">
        {/* Info card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Échange sécurisé</p>
              <p className="text-amber-700 text-xs mt-1">
                {isOwner
                  ? "Générez un code et communiquez-le au locataire pour confirmer la remise."
                  : "Demandez le code au propriétaire et saisissez-le pour valider la remise."}
              </p>
            </div>
          </div>
        </div>

        {/* Item info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          {booking.item_photo && (
            <img src={booking.item_photo} alt="" className="w-14 h-14 rounded-xl object-cover" />
          )}
          <div>
            <p className="font-semibold text-sm">{booking.item_title}</p>
            <p className="text-xs text-gray-400">
              {isOwner ? `Locataire : ${booking.renter_name}` : `Propriétaire : ${booking.owner_name}`}
            </p>
          </div>
        </div>

        {/* Owner: generate code */}
        {isOwner && (
          <div className="space-y-4">
            {booking[codeField] && booking[confirmedOwnerField] ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Communiquez ce code au locataire :</p>
                <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 inline-block">
                  <p className="text-5xl font-bold tracking-[0.3em] text-amber-600">
                    {booking[codeField]}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {isHandover ? "En attente de confirmation du locataire…" : "En attente de confirmation du retour…"}
                </p>
              </div>
            ) : (
              <Button
                onClick={generateAndSaveCode}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                <Key className="w-4 h-4 mr-2" />
                Générer le code
              </Button>
            )}
          </div>
        )}

        {/* Renter: enter code */}
        {!isOwner && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Saisissez le code fourni par le propriétaire
              </p>
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="_ _ _ _"
                maxLength={4}
                className="rounded-xl text-center text-2xl tracking-widest font-bold h-14"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <Button
              onClick={confirmWithCode}
              disabled={codeInput.length !== 4 || loading}
              className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Valider la remise
            </Button>
          </div>
        )}

        {/* Steps guide */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Comment ça marche</p>
          {[
            { step: "1", text: "Le propriétaire génère un code unique" },
            { step: "2", text: "Le locataire entre le code pour confirmer la remise" },
            { step: "3", text: "L'échange est sécurisé et enregistré" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <p className="text-sm text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}