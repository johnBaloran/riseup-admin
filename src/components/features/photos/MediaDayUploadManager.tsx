// src/components/features/photos/MediaDayUploadManager.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Manages media day photo uploads ONLY
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Location {
  _id: string;
  name: string;
  address?: string;
}

interface Photo {
  _id?: string;
  publicId: string;
  url: string;
  thumbnail: string;
  uploadedAt: Date;
}

interface MediaDayUploadManagerProps {
  locations: Location[];
}

export function MediaDayUploadManager({
  locations,
}: MediaDayUploadManagerProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadWidget, setUploadWidget] = useState<any>(null);
  const uploadingPhotosRef = useRef<Set<string>>(new Set());

  /**
   * Load existing photos when location and date are selected
   */
  useEffect(() => {
    if (!selectedLocation || !selectedDate) {
      setPhotos([]);
      return;
    }

    const fetchPhotos = async () => {
      try {
        // Use YYYY-MM-DD format to avoid timezone issues
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const response = await fetch(
          `/api/v1/photos/media-day?locationId=${selectedLocation}&date=${dateStr}`
        );

        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };

    fetchPhotos();
  }, [selectedLocation, selectedDate]);

  /**
   * Handle successful upload
   */
  const handleUploadSuccess = useCallback(
    async (result: any) => {
      const publicId = result.info.public_id;

      if (uploadingPhotosRef.current.has(publicId)) {
        return;
      }

      try {
        setIsUploading(true);
        uploadingPhotosRef.current.add(publicId);

        // Use YYYY-MM-DD format to avoid timezone issues
        const dateStr = format(selectedDate!, "yyyy-MM-dd");

        const photoData = {
          publicId,
          url: result.info.secure_url,
          thumbnail: result.info.thumbnail_url || result.info.secure_url,
          location: selectedLocation,
          date: dateStr,
          tags: result.info.tags || [],
        };

        const response = await fetch(`/api/v1/photos/media-day`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(photoData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save photo");
        }

        const savedPhoto = await response.json();

        setPhotos((prev) => {
          if (prev.some((p) => p.publicId === publicId)) {
            return prev;
          }
          return [savedPhoto, ...prev];
        });

        toast.success("Photo uploaded successfully");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Failed to upload photo");
      } finally {
        uploadingPhotosRef.current.delete(publicId);
        if (uploadingPhotosRef.current.size === 0) {
          setIsUploading(false);
        }
      }
    },
    [selectedLocation, selectedDate]
  );

  /**
   * Initialize and open Cloudinary widget
   */
  const handleUploadClick = useCallback(() => {
    if (!selectedLocation) {
      toast.error("Please select a location first");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Upload configuration missing");
      return;
    }

    // Create folder structure: media-day-photos/{locationId}/{date}
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const folder = `media-day-photos/${selectedLocation}/${dateStr}`;

    const location = locations.find((l) => l._id === selectedLocation);

    const widget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder,
        multiple: true,
        maxFiles: 300,
        resourceType: "image",
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
        maxFileSize: 10000000, // 10MB
        sources: ["local", "camera", "url"],
        showUploadMoreButton: true,
        showCompletedButton: true,
        cropping: false,
        transformation: [
          {
            quality: "auto:best",
            fetch_format: "auto",
          },
        ],
        tags: [
          "media-day",
          `location-${selectedLocation}`,
          location?.name,
          dateStr,
        ]
          .filter(Boolean)
          .map((tag) => tag!.toString().replace(/\s+/g, "_").toLowerCase()),
        styles: {
          palette: {
            window: "#FFFFFF",
            sourceBg: "#F4F4F5",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            inactiveTabIcon: "#555A5F",
            menuIcons: "#555A5F",
            link: "#0078FF",
            action: "#FF620C",
            inProgress: "#0078FF",
            complete: "#20B832",
            error: "#EA2727",
            textDark: "#000000",
            textLight: "#FFFFFF",
          },
        },
      },
      (error: any, result: any) => {
        if (error) {
          console.error("Cloudinary widget error:", error);
          toast.error(error.message || "Error with upload widget");
          return;
        }

        if (result?.event === "success") {
          handleUploadSuccess(result);
        }
      }
    );

    widget.open();
  }, [selectedLocation, selectedDate, locations, handleUploadSuccess]);

  /**
   * Load Cloudinary script
   */
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://upload-widget.cloudinary.com/global/all.js"]'
    );

    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete photo");
    }
  };

  return (
    <div className="space-y-6">
      {/* Selection Form */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location._id} value={location._id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Media Day Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Upload Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium">&nbsp;</label>
            <Button
              onClick={handleUploadClick}
              disabled={!selectedLocation || !selectedDate || isUploading}
              size="lg"
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photos
                </>
              )}
            </Button>
          </div>
        </div>

        {/* {selectedLocation && selectedDate && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Cloudinary Folder:</strong> media-day-photos/
              {selectedLocation}/{format(selectedDate, "yyyy-MM-dd")}/
            </p>
          </div>
        )} */}
      </Card>

      {/* Photo Grid */}
      {selectedLocation && selectedDate && (
        <>
          {photos.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-gray-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No photos yet</p>
                <p className="text-sm mt-1">
                  Upload photos from this media day to get started
                </p>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Uploaded Photos ({photos.length})
                </h2>
              </div>
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

                    {/* Upload Date */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs p-2">
                      {new Date(photo.uploadedAt).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
