import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, ArrowLeft, Loader2, Navigation } from "lucide-react";
import { getAllCategories } from "../components/shared/CategoryIcon";

export default function AddItem() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price_per_day: "",
    deposit_amount: "",
    location: "",
    latitude: null,
    longitude: null,
    rules: "",
    photos: [],
    delivery_options: "pickup",
  });

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      if (!form.location && u.location) {
        setForm(prev => ({ ...prev, location: u.location }));
      }
      if (editId) {
        const items = await base44.entities.Item.filter({ id: editId });
        if (items.length > 0) {
          const item = items[0];
          setForm({
            title: item.title || "",
            description: item.description || "",
            category: item.category || "",
            price_per_day: item.price_per_day?.toString() || "",
            deposit_amount: item.deposit_amount?.toString() || "",
            location: item.location || "",
            latitude: item.latitude || null,
            longitude: item.longitude || null,
            rules: item.rules || "",
            photos: item.photos || [],
            delivery_options: item.delivery_options || "pickup",
          });
        }
      }
    };
    load();
  }, [editId]);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    const newPhotos = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newPhotos.push(file_url);
    }
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    setUploading(false);
  };

  const removePhoto = (index) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode with Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || "";
          setForm(prev => ({ ...prev, latitude, longitude, location: city || prev.location }));
        } catch {
          setForm(prev => ({ ...prev, latitude, longitude }));
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    const data = {
      ...form,
      price_per_day: parseFloat(form.price_per_day) || 0,
      deposit_amount: parseFloat(form.deposit_amount) || 0,
      owner_name: user.full_name,
      owner_email: user.email,
      status: "active",
    };
    if (editId) {
      await base44.entities.Item.update(editId, data);
    } else {
      await base44.entities.Item.create(data);
    }
    setLoading(false);
    navigate(createPageUrl("Profile"));
  };

  const categories = getAllCategories();
  const isValid = form.title && form.category && form.price_per_day && form.location;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold">{editId ? "Modifier l'annonce" : "Publier un objet"}</h1>
      </div>

      <div className="px-5 py-6 space-y-5 pb-32">
        {/* Photos */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Photos</Label>
          <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
            {form.photos.map((url, i) => (
              <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 flex-shrink-0 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-300 transition-colors">
              {uploading ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 mt-1">Ajouter</span>
                </>
              )}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Titre *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="ex. Perceuse DeWalt 18V"
            className="mt-1.5 rounded-xl"
          />
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez l'objet, son état, ce qui est inclus..."
            className="mt-1.5 rounded-xl h-24"
          />
        </div>

        {/* Category */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Catégorie *</Label>
          <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
            <SelectTrigger className="mt-1.5 rounded-xl">
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price & Deposit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-gray-700">Prix/jour (€) *</Label>
            <Input
              type="number"
              value={form.price_per_day}
              onChange={(e) => setForm({ ...form, price_per_day: e.target.value })}
              placeholder="15"
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Caution (€)</Label>
            <Input
              type="number"
              value={form.deposit_amount}
              onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })}
              placeholder="50"
              className="mt-1.5 rounded-xl"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Localisation *</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ville ou quartier"
              className="rounded-xl flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={detectLocation}
              disabled={locating}
              className="rounded-xl border-amber-200 text-amber-600 px-3 flex-shrink-0"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            </Button>
          </div>
          {form.latitude && form.longitude && (
            <p className="text-xs text-amber-600 mt-1">
              ✓ Position GPS enregistrée ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})
            </p>
          )}
        </div>

        {/* Delivery options */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Mode de remise</Label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {[
              { value: "pickup", label: "Main propre" },
              { value: "delivery", label: "Livraison" },
              { value: "both", label: "Les deux" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, delivery_options: opt.value })}
                className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                  form.delivery_options === opt.value
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div>
          <Label className="text-sm font-medium text-gray-700">Règles & Conditions</Label>
          <Textarea
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
            placeholder="Règles particulières pour les locataires..."
            className="mt-1.5 rounded-xl h-20"
          />
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-base font-semibold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editId ? "Mettre à jour" : "Publier l'annonce"}
        </Button>
      </div>
    </div>
  );
}