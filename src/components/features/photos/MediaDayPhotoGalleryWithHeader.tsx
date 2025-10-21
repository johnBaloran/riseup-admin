// src/components/features/photos/MediaDayPhotoGalleryWithHeader.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display media day photos with dynamic header ONLY
 */

"use client";

import { useState } from "react";
import { MediaDayPhotoGallery } from "./MediaDayPhotoGallery";
import { MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Photo {
  _id?: string;
  publicId: string;
  url: string;
  thumbnail: string;
  uploadedAt: Date;
  tags?: string[];
  isHighlight?: boolean;
}

interface Location {
  _id: any;
  name: string;
  address?: string;
  city?: any;
}

interface MediaDayPhotoGalleryWithHeaderProps {
  photos: Photo[];
  location: Location;
  locationId: string;
  dateStr: string;
}

export function MediaDayPhotoGalleryWithHeader({
  photos: initialPhotos,
  location,
  locationId,
  dateStr,
}: MediaDayPhotoGalleryWithHeaderProps) {
  const [photoCount, setPhotoCount] = useState(initialPhotos.length);

  const handlePhotoDeleted = () => {
    setPhotoCount((prev) => prev - 1);
  };

  const date = new Date(dateStr + "T00:00:00Z");

  return (
    <>
      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{location.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {format(new Date(dateStr + "T12:00:00Z"), "MMMM d, yyyy")}
          </span>
        </div>
        <div>
          <span className="font-medium">{photoCount} photos</span>
        </div>
      </div>

      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
        <p className="text-blue-900">
          <strong>Cloudinary Folder:</strong> media-day-photos/{locationId}/{dateStr}/
        </p>
      </div>

      <MediaDayPhotoGallery
        photos={initialPhotos}
        locationId={locationId}
        date={date}
        onPhotoDeleted={handlePhotoDeleted}
      />
    </>
  );
}
