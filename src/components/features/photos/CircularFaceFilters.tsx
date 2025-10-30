"use client";

import { useEffect, useState } from "react";
import { Loader2, UserCircle, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GamePersonsResponse } from "@/types/faceRecognition";

interface Photo {
  _id?: string;
  publicId: string;
  detectedFaces?: Array<{
    personId?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface Props {
  gameId: string;
  selectedPersonId: string | null | undefined;
  onPersonSelect: (personId: string | null) => void;
  photos: Photo[]; // Photos to calculate counts from
}

export function CircularFaceFilters({
  gameId,
  selectedPersonId,
  onPersonSelect,
  photos,
}: Props) {
  const [gamePersons, setGamePersons] = useState<GamePersonsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamePersons();
  }, [gameId]);

  const fetchGamePersons = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/persons/game/${gameId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch persons");
      }

      const result = await response.json();
      setGamePersons(result.data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate photo counts from photos prop (frontend calculation)
  const personsWithCounts = gamePersons?.persons.map((person) => {
    const photoCount = photos.filter((photo) =>
      photo.detectedFaces?.some(
        (face) => face.personId?.toString() === person._id
      )
    ).length;

    return {
      ...person,
      photoCount, // Override backend count with frontend calculation
    };
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!gamePersons || personsWithCounts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            People in this game
          </h3>
          {selectedPersonId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPersonSelect(null)}
              className="h-7 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Horizontal scrollable circular faces */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide py-5 px-2">
          {/* Known persons */}
          {personsWithCounts.map((person) => {
            const faceCropUrl = person.faceCropUrl;
            const isSelected = selectedPersonId === person._id;

            return (
              <div
                key={person._id}
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
                onClick={() => onPersonSelect(person._id)}
              >
                {/* Circular face image */}
                <div
                  className={`relative w-16 h-16 rounded-full overflow-hidden transition-all ${
                    isSelected
                      ? "ring-4 ring-blue-500 scale-110"
                      : "ring-2 ring-gray-200 hover:ring-gray-300 hover:scale-105"
                  }`}
                >
                  {faceCropUrl ? (
                    <Image
                      src={faceCropUrl}
                      alt="Person"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <UserCircle className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Photo count badge */}
                <div className="text-center">
                  <p className="text-xs text-gray-600">
                    {person.photoCount}{" "}
                    {person.photoCount === 1 ? "photo" : "photos"}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Unknown faces - photos without any person */}
          <div
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
            onClick={() => onPersonSelect("unknown")}
          >
            <div
              className={`relative w-16 h-16 rounded-full overflow-hidden transition-all ${
                selectedPersonId === "unknown"
                  ? "ring-4 ring-gray-500 scale-110"
                  : "ring-2 ring-gray-200 hover:ring-gray-300 hover:scale-105"
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 font-medium">Unknown</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
