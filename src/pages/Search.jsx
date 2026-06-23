import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search as SearchIcon, SlidersHorizontal, X, Map, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import ItemCard from "../components/shared/ItemCard";
import CategoryIcon, { getAllCategories } from "../components/shared/CategoryIcon";

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Search() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(200);
  const [maxDistance, setMaxDistance] = useState(50);
  const [handoverFilter, setHandoverFilter] = useState("all");
  const [sortBy, setSortBy] = useState("-created_date");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [proximityAlert, setProximityAlert] = useState(null);

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ["items-search"],
    queryFn: () => base44.entities.Item.filter({ status: "active" }, "-created_date", 100),
  });

  // Auto-detect location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  // Proximity alert: check for nearby items matching search
  useEffect(() => {
    if (!searchTerm || !userLocation || allItems.length === 0) { setProximityAlert(null); return; }
    const nearbyMatches = allItems.filter(item => {
      if (!item.latitude || !item.longitude) return false;
      const dist = haversineKm(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
      return dist <= 5 && item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    });
    if (nearbyMatches.length > 0) {
      setProximityAlert(`${nearbyMatches.length} objet${nearbyMatches.length > 1 ? "s" : ""} "${searchTerm}" trouvé${nearbyMatches.length > 1 ? "s" : ""} à moins de 5 km !`);
    } else {
      setProximityAlert(null);
    }
  }, [searchTerm, userLocation, allItems]);

  const requestLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const filteredItems = allItems.filter((item) => {
    const matchesSearch = !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesPrice = item.price_per_day <= maxPrice;

    // Distance filter
    if (userLocation && item.latitude && item.longitude) {
      const dist = haversineKm(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
      if (dist > maxDistance) return false;
    }

    // Handover mode filter
    if (handoverFilter === "pickup" && item.delivery_options === "delivery") return false;
    if (handoverFilter === "delivery" && item.delivery_options === "pickup") return false;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "price_asc") return a.price_per_day - b.price_per_day;
    if (sortBy === "price_desc") return b.price_per_day - a.price_per_day;
    if (sortBy === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
    if (sortBy === "distance" && userLocation) {
      const dA = a.latitude ? haversineKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude) : 999;
      const dB = b.latitude ? haversineKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude) : 999;
      return dA - dB;
    }
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher des objets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl border-gray-200 bg-gray-50 h-10"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <Link to={createPageUrl("MapView")}>
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-gray-200 text-amber-600">
                <Map className="w-4 h-4" />
              </Button>
            </Link>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-gray-200">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 py-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Prix max : {maxPrice}€/jour
                    </label>
                    <Slider value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v)} max={500} min={1} step={5} />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Distance max : {maxDistance} km
                      {!userLocation && <span className="text-amber-500 text-xs ml-2">(localisation requise)</span>}
                    </label>
                    <Slider value={[maxDistance]} onValueChange={([v]) => setMaxDistance(v)} max={100} min={1} step={1} />
                    {!userLocation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestLocation}
                        disabled={locating}
                        className="mt-2 rounded-xl border-amber-200 text-amber-600 text-xs"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        {locating ? "Localisation..." : "Activer ma position"}
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Mode de remise</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "all", label: "Tous" },
                        { value: "pickup", label: "Main propre" },
                        { value: "delivery", label: "Livraison" },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setHandoverFilter(opt.value)}
                          className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                            handoverFilter === opt.value
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-white text-gray-600 border-gray-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Trier par</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-created_date">Plus récents</SelectItem>
                        <SelectItem value="price_asc">Prix croissant</SelectItem>
                        <SelectItem value="price_desc">Prix décroissant</SelectItem>
                        <SelectItem value="rating">Mieux notés</SelectItem>
                        <SelectItem value="distance">Les plus proches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => setFiltersOpen(false)}
                    className="w-full bg-amber-500 hover:bg-amber-600 rounded-xl"
                  >
                    Appliquer les filtres
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-2 px-4 pb-3 no-scrollbar">
          <Badge
            variant={!selectedCategory ? "default" : "outline"}
            className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-xs ${
              !selectedCategory ? "bg-amber-500 hover:bg-amber-600 border-0" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedCategory("")}
          >
            Tout
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                selectedCategory === cat.value ? "bg-amber-500 hover:bg-amber-600 border-0" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? "" : cat.value)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Proximity alert */}
      {proximityAlert && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">{proximityAlert}</p>
        </div>
      )}

      {/* Results */}
      <div className="px-4 py-4">
        <p className="text-xs text-gray-400 mb-3">
          {sortedItems.length} objet{sortedItems.length > 1 ? "s" : ""} trouvé{sortedItems.length > 1 ? "s" : ""}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] rounded-2xl" />
                <Skeleton className="h-4 w-3/4 mt-2.5" />
                <Skeleton className="h-3 w-1/2 mt-1.5" />
              </div>
            ))}
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-gray-200 mx-auto" />
            <p className="text-gray-400 mt-3 text-sm">Aucun objet trouvé</p>
            <p className="text-gray-300 text-xs mt-1">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {sortedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}