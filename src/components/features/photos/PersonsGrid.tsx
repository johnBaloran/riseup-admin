"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Image as ImageIcon, Loader2, UserCircle } from "lucide-react";
import Image from "next/image";
import { GamePersonsResponse } from "@/types/faceRecognition";

interface GamePhoto {
  _id: string;
  url: string;
  thumbnail?: string;
}

interface Props {
  gameId: string;
  photos?: GamePhoto[]; // Optional array of game photos
  onPersonClick?: (personId: string) => void;
  selectedPersonId?: string | null;
}

export function PersonsGrid({ gameId, photos = [], onPersonClick, selectedPersonId }: Props) {
  const [gamePersons, setGamePersons] = useState<GamePersonsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGamePersons();
  }, [gameId]);

  const fetchGamePersons = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/persons/game/${gameId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch persons");
      }

      const result = await response.json();
      setGamePersons(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-gray-500">Loading persons...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-sm text-red-500">{error}</div>
      </Card>
    );
  }

  if (!gamePersons || gamePersons.totalPersons === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No persons detected yet
          </h3>
          <p className="text-sm text-gray-500">
            Process photos to detect faces and identify persons
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detected Persons</h3>
          <p className="text-sm text-gray-500">
            {gamePersons.totalPersons} unique{" "}
            {gamePersons.totalPersons === 1 ? "person" : "persons"} found
          </p>
        </div>
      </div>

      {/* Persons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {gamePersons.persons.map((person) => {
          // Use faceCropUrl from Person model (the representative face image)
          const faceCropUrl = person.faceCropUrl;

          const isSelected = selectedPersonId === person._id;

          return (
            <Card
              key={person._id}
              className={`p-4 hover:shadow-lg transition-all cursor-pointer ${
                isSelected
                  ? "ring-2 ring-blue-500 shadow-lg bg-blue-50"
                  : ""
              }`}
              onClick={() => onPersonClick?.(person._id)}
            >
              <div className="space-y-3">
                {/* Person Photo/Avatar */}
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden relative">
                  {faceCropUrl ? (
                    <Image
                      src={faceCropUrl}
                      alt={`Person ${person._id.slice(-6)}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Person Info */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    Person #{person._id.slice(-6)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ImageIcon className="w-3 h-3" />
                    <span>{person.photoCount} photos</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Quality: {Math.round(person.metadata.qualityScore)}%
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
