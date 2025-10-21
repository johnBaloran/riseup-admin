// src/components/features/photos/MediaDayGallery.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display media day photo sessions with filters ONLY
 */

"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar as CalendarIcon, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

interface Photo {
  _id: any;
  url: string;
  thumbnail: string;
  publicId: string;
  uploadedAt: Date;
}

interface MediaDaySession {
  location: {
    _id: any;
    name: string;
    address?: string;
    city?: {
      cityName: string;
    };
  };
  date: string; // YYYY-MM-DD format
  photoCount: number;
  photos: Photo[];
}

interface Location {
  _id: any;
  name: string;
}

interface MediaDayGalleryProps {
  sessions: MediaDaySession[];
  locations: Location[];
  filters: {
    locationId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function MediaDayGallery({
  sessions,
  locations,
  filters,
}: MediaDayGalleryProps) {
  const router = useRouter();

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const newFilters = { ...filters, ...updates };

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    return queryString ? `/photos/media-day?${queryString}` : "/photos/media-day";
  };

  const handleFilterChange = (key: string, value: string) => {
    router.push(buildUrl({ [key]: value === "all" ? undefined : value }));
  };

  const totalPhotos = sessions.reduce(
    (sum, session) => sum + session.photoCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold">{sessions.length}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Photos</p>
              <p className="text-2xl font-bold">{totalPhotos}</p>
            </div>
            <ImageIcon className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Locations</p>
              <p className="text-2xl font-bold">
                {new Set(sessions.map((s) => s.location._id)).size}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Select
              value={filters.locationId || "all"}
              onValueChange={(value) => handleFilterChange("locationId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location._id} value={location._id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No media day sessions found</p>
            <p className="text-sm mt-1">
              Upload photos to create your first media day session
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session, index) => {
            // session.date is already in YYYY-MM-DD format from aggregation
            const viewUrl = `/photos/media-day/${session.location._id}/${session.date}`;

            return (
              <Card
                key={`${session.location._id}-${session.date}-${index}`}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(viewUrl)}
              >
              {/* Preview Image */}
              <div className="aspect-video relative bg-gray-100">
                {session.photos[0] ? (
                  <img
                    src={session.photos[0].url}
                    alt="Session preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-black/60 text-white">
                    {session.photoCount} photos
                  </Badge>
                </div>
              </div>

              {/* Session Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {session.location.name}
                    </p>
                    {session.location.city && (
                      <p className="text-xs text-gray-600">
                        {session.location.city.cityName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600">
                    {format(new Date(session.date + "T12:00:00Z"), "MMMM d, yyyy")}
                  </p>
                </div>

                {/* Photo Grid Preview */}
                {session.photos.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 pt-2">
                    {session.photos.slice(0, 4).map((photo) => (
                      <div
                        key={photo._id}
                        className="aspect-square rounded overflow-hidden bg-gray-100"
                      >
                        <img
                          src={photo.thumbnail}
                          alt="Preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
