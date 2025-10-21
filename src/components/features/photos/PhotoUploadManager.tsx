// src/components/features/photos/PhotoUploadManager.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Manages photo upload and display for a game ONLY
 *
 * Improvements over legacy code:
 * - Organized Cloudinary folders by division
 * - Better error handling and user feedback
 * - Optimized state management
 * - Duplicate prevention with Set data structure
 * - Proper TypeScript typing
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

interface Game {
  _id: string;
  gameName: string;
  date: Date;
  week?: number;
  homeTeamScore?: number;
  awayTeamScore?: number;
  homeTeam?: any;
  awayTeam?: any;
  division: any;
}

interface Photo {
  _id?: string;
  publicId: string;
  url: string;
  thumbnail: string;
  uploadedAt: Date;
}

interface PhotoUploadManagerProps {
  game: Game;
  initialPhotos: Photo[];
}

export function PhotoUploadManager({
  game,
  initialPhotos,
}: PhotoUploadManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadWidget, setUploadWidget] = useState<any>(null);
  const uploadingPhotosRef = useRef<Set<string>>(new Set());

  /**
   * Handle successful upload
   * Uses Set to prevent duplicate processing
   */
  const handleUploadSuccess = useCallback(
    async (result: any) => {
      const publicId = result.info.public_id;

      // Prevent duplicate processing
      if (uploadingPhotosRef.current.has(publicId)) {
        return;
      }

      try {
        setIsUploading(true);
        uploadingPhotosRef.current.add(publicId);

        const photoData = {
          publicId,
          url: result.info.secure_url,
          thumbnail: result.info.thumbnail_url || result.info.secure_url,
          game: game._id,
          tags: result.info.tags || [],
        };

        // Save to database via API
        const response = await fetch(`/api/v1/photos/games/${game._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(photoData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save photo");
        }

        const savedPhoto = await response.json();

        // Update local state
        setPhotos((prev) => {
          // Check for duplicates in state
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
        // Only stop loading if no more uploads in progress
        if (uploadingPhotosRef.current.size === 0) {
          setIsUploading(false);
        }
      }
    },
    [game._id, toast]
  );

  /**
   * Load Cloudinary script and initialize widget
   */
  useEffect(() => {
    if (uploadWidget) return; // Already initialized

    const initializeWidget = () => {
      if (typeof window === "undefined" || !(window as any).cloudinary) {
        console.error("Cloudinary script not loaded");
        return;
      }

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        console.error("Cloudinary credentials not configured");
        toast.error("Upload configuration missing. Please contact support.");
        return;
      }

      // Folder structure: game-photos/{gameId}
      // This matches your existing Cloudinary structure for consistency
      const folder = `game-photos/${game._id}`;

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
          // Auto-optimize images
          transformation: [
            {
              quality: "auto:best",
              fetch_format: "auto",
            },
          ],
          // Tag photos for easier management
          tags: [
            `game-${game._id}`,
            game.homeTeam?.teamName,
            game.awayTeam?.teamName,
            new Date(game.date).toISOString().split("T")[0],
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

      setUploadWidget(widget);
    };

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src="https://upload-widget.cloudinary.com/global/all.js"]'
    );

    if (existingScript) {
      // Script already loaded, initialize immediately
      if ((window as any).cloudinary) {
        initializeWidget();
      } else {
        existingScript.addEventListener("load", initializeWidget);
      }
    } else {
      // Load script
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.onload = initializeWidget;
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [uploadWidget, game._id, game.division._id, game.week, game.homeTeam?.teamName, game.awayTeam?.teamName, game.date, handleUploadSuccess]);

  /**
   * Open upload widget
   */
  const handleUploadClick = () => {
    if (!uploadWidget) {
      toast.error("Upload widget is loading. Please try again.");
      return;
    }

    uploadWidget.open();
  };

  /**
   * Delete photo
   */
  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/photos/games/${game._id}/${photo._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete photo");
      }

      // Update local state
      setPhotos((prev) => prev.filter((p) => p.publicId !== photo.publicId));

      toast.success("Photo deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete photo");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Game Photos</h2>
            <p className="text-sm text-gray-600 mt-1">
              {photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded
            </p>
          </div>
          <Button onClick={handleUploadClick} disabled={isUploading} size="lg">
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
      </Card>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No photos yet</p>
            <p className="text-sm mt-1">
              Upload photos from this game to get started
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.publicId}
              className="group relative aspect-square overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={photo.url}
                alt="Game photo"
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
      )}
    </div>
  );
}
