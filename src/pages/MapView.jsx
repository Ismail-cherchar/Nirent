import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Locate, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import L from "leaflet";

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const goldIcon = new L.DivIcon({
  html: `<div style="background:#d97706;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  className: "",
});

const userIcon = new L.DivIcon({
  html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  className: "",
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [position]);
  return null;
}

export default function MapView() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [center, setCenter] = useState([48.8566, 2.3522]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Item.filter({ status: "active" }, "-created_date", 100);
      setItems(data.filter(i => i.latitude && i.longitude));
      setLoading(false);
    };
    load();
    // Try geolocation
    navigator.geolocation?.getCurrentPosition(pos => {
      const p = [pos.coords.latitude, pos.coords.longitude];
      setUserPos(p);
      setCenter(p);
    });
  }, []);

  const locateMe = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      const p = [pos.coords.latitude, pos.coords.longitude];
      setUserPos(p);
      setCenter(p);
    }, () => alert("Géolocalisation non disponible"));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-50 relative">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold flex-1">Carte des objets</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={locateMe}
          className="rounded-xl border-amber-200 text-amber-600"
        >
          <Locate className="w-4 h-4 mr-1" /> Me localiser
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : (
          <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap position={userPos} />
            {userPos && (
              <>
                <Marker position={userPos} icon={userIcon}>
                  <Popup><b>Ma position</b></Popup>
                </Marker>
                <Circle center={userPos} radius={2000} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.05 }} />
              </>
            )}
            {items.map(item => (
              <Marker key={item.id} position={[item.latitude, item.longitude]} icon={goldIcon}>
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    {item.photos?.[0] && (
                      <img src={item.photos[0]} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                    )}
                    <p className="font-bold">{item.title}</p>
                    <p className="text-amber-600 font-semibold">€{item.price_per_day}/jour</p>
                    <p className="text-gray-400 text-xs">{item.location}</p>
                    <a
                      href={createPageUrl(`ItemDetail?id=${item.id}`)}
                      className="block mt-2 text-center bg-amber-500 text-white rounded-lg py-1 text-xs font-medium"
                    >
                      Voir l'annonce
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-md px-3 py-2 text-xs space-y-1 z-[1000]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-600" />
            <span className="text-gray-600">Objet disponible ({items.length})</span>
          </div>
          {userPos && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Ma position</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}