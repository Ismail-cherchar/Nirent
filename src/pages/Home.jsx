import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "../components/home/HeroSection";
import CategoryRow from "../components/home/CategoryRow";
import NearbyItems from "../components/home/NearbyItems";

export default function Home() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items-home"],
    queryFn: () => base44.entities.Item.filter({ status: "active" }, "-created_date", 8),
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <HeroSection />
      <CategoryRow />
      <NearbyItems items={items} isLoading={isLoading} />
    </div>
  );
}