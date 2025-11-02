// src/components/features/league/players/PlayerPhotos.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display player photos in a grid layout
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ImageIcon, Calendar, Trophy } from "lucide-react";
import { format } from "date-fns";

interface Photo {
  _id: any;
  url: string;
  thumbnail: string;
  uploadedAt: Date;
  game?: any; // Can be ObjectId, string, or populated game object
}

interface PlayerPhotosProps {
  photos: Photo[];
}

export function PlayerPhotos({ photos }: PlayerPhotosProps) {
  if (!photos || photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Player Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No photos available</p>
            <p className="text-sm mt-1">
              This player hasn't been linked to any game photos yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Player Photos
          </div>
          <span className="text-sm font-normal text-gray-500">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all cursor-pointer"
            >
              <Image
                src={photo.url}
                alt="Player photo"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay with game info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  {photo.game && typeof photo.game === "object" && (
                    <>
                      <div className="flex items-center gap-1 text-xs mb-1">
                        <Trophy className="w-3 h-3" />
                        <span className="font-medium truncate">
                          {photo.game.gameName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-200">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(photo.game.date), "MMM d, yyyy")}
                        </span>
                      </div>
                    </>
                  )}
                  {(!photo.game || typeof photo.game === "string") && (
                    <div className="text-xs text-gray-200">
                      {format(new Date(photo.uploadedAt), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
