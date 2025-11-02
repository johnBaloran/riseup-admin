// src/components/features/league/players/PlayerPhotos.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Displays a grid of player photos ONLY
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface Photo {
  _id: string;
  thumbnail: string;
  url: string;
}

interface PlayerPhotosProps {
  photos: Photo[];
}

export function PlayerPhotos({ photos }: PlayerPhotosProps) {
  if (!photos || photos.length === 0) {
    return null; // Don't render anything if there are no photos
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <a href={photo.url} target="_blank" rel="noopener noreferrer" key={photo._id}>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={photo.thumbnail}
                  alt="Player photo"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
