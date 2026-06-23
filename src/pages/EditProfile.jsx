import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import UserBadges, { getUserBadges } from "../components/shared/UserBadges";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ bio: "", phone: "", location: "", profile_photo: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      setForm({ bio: u.bio || "", phone: u.phone || "", location: u.location || "", profile_photo: u.profile_photo || "" });
    };
    load();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, profile_photo: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    await base44.auth.updateMe(form);
    setLoading(false);
    navigate(-1);
  };

  const previewBadges = getUserBadges({ ...user, ...form });
  const isVerified = form.profile_photo && form.bio && form.phone && form.location;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold">Modifier le profil</h1>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Photo */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
              {form.profile_photo ? (
                <img src={form.profile_photo} alt="" className="w-full h-full object-cover" />
              ) : uploading ? (
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>

        {/* Badge preview */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-700 mb-2">Vos badges</p>
          <UserBadges user={{ ...user, ...form }} reviewCount={0} avgRating={0} size="sm" />
          {!isVerified && (
            <p className="text-xs text-gray-400 mt-2">
              Complétez votre profil (photo, bio, téléphone, ville) pour obtenir le badge "Profil vérifié"
            </p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Nom</Label>
          <Input value={user?.full_name || ""} disabled className="mt-1.5 rounded-xl bg-gray-50" />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <Input value={user?.email || ""} disabled className="mt-1.5 rounded-xl bg-gray-50" />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Téléphone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+33 6 12 34 56 78"
            className="mt-1.5 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Ville</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Paris, Lyon, Marseille..."
            className="mt-1.5 rounded-xl"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Bio</Label>
          <Textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Parlez de vous aux autres membres..."
            className="mt-1.5 rounded-xl h-24"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-base font-semibold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}