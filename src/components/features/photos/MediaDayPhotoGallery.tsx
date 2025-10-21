// src/components/features/photos/MediaDayPhotoGallery.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display media day photos in a gallery ONLY
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Image as ImageIcon } from "lucide-react";

interface Photo {
  _id?: string;
  publicId: string;
  url: string;
  thumbnail: string;
  uploadedAt: Date;
  tags?: string[];
  isHighlight?: boolean;
}

interface MediaDayPhotoGalleryProps {
  photos: Photo[];
  locationId: string;
  date: Date;
  onPhotoDeleted?: () => void;
}

export function MediaDayPhotoGallery({
  photos: initialPhotos,
  locationId,
  date,
  onPhotoDeleted,
}: MediaDayPhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);

  /**
   * Delete photo
   */
  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/photos/media-day/${photo._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete photo");
      }

      setPhotos((prev) => prev.filter((p) => p.publicId !== photo.publicId));
      toast.success("Photo deleted successfully");

      // Notify parent component of deletion
      if (onPhotoDeleted) {
        onPhotoDeleted();
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete photo");
    }
  };

  if (photos.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No photos found</p>
          <p className="text-sm mt-1">
            Photos from this media day session will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <Card
          key={photo.publicId}
          className="group relative aspect-square overflow-hidden hover:shadow-lg transition-shadow"
        >
          <img
            src={photo.url}
            alt="Media day photo"
            className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />

          {/* Delete Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="destructive"
              onClick={() => handleDeletePhoto(photo)}
              className="h-8 w-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
