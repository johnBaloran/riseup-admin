// src/components/layout/CitySelector.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * City selection dropdown ONLY
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";
import { getActiveCities } from "@/lib/db/queries/cities";

interface CitySelectorProps {
  currentCityId: string;
}

export function CitySelector({ currentCityId }: CitySelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/cities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCities(data.data);
        setLoading(false);
      });
  }, []);

  const handleCityChange = (newCityId: string) => {
    const pathSegments = pathname.split("/");
    const routeAfterCity = pathSegments.slice(3).join("/") || "dashboard";
    router.push(`/${newCityId}/${routeAfterCity}`);
  };

  return (
    <div className="relative">
      <select
        value={currentCityId}
        onChange={(e) => handleCityChange(e.target.value)}
        disabled={loading}
        className="appearance-none bg-white border border-gray-300 rounded-lg
          pl-10 pr-10 py-2 text-sm font-medium hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {loading ? (
          <option>Loading...</option>
        ) : (
          cities.map((city) => (
            <option key={city._id} value={city._id}>
              {city.cityName}, {city.region}
            </option>
          ))
        )}
      </select>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
}
