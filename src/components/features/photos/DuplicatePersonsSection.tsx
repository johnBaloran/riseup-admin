"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users, GitMerge, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { GamePersonsResponse } from "@/types/faceRecognition";
import { MergePersonsModal } from "./MergePersonsModal";

interface Props {
  gameId: string;
}

export function DuplicatePersonsSection({ gameId }: Props) {
  const [gamePersons, setGamePersons] = useState<GamePersonsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

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

  const togglePersonSelection = (personId: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    );
  };

  const handleMergeClick = () => {
    if (selectedPersonIds.length < 2) {
      toast.error("Please select at least 2 persons to merge");
      return;
    }
    setIsMergeModalOpen(true);
  };

  const handleMergeSuccess = async () => {
    setSelectedPersonIds([]);
    setIsMergeModalOpen(false);
    await fetchGamePersons();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (!gamePersons) {
    return null;
  }

  // Filter to show only unlinked persons
  const unlinkedPersons = gamePersons.persons.filter(
    (person) => !person.playerId
  );

  if (unlinkedPersons.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-semibold">Review & Merge Duplicates</h2>
          </div>
          <Button
            onClick={handleMergeClick}
            disabled={selectedPersonIds.length < 2}
            className="gap-2"
          >
            <GitMerge className="w-4 h-4" />
            Merge Selected ({selectedPersonIds.length})
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">
                Select duplicate persons to merge them into one
              </p>
              <p className="text-xs text-blue-700">
                Merging will transfer all photos from secondary persons to the
                primary person. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {unlinkedPersons.map((person) => {
            const faceCropUrl = person.faceCropUrl;
            const isSelected = selectedPersonIds.includes(person._id);

            return (
              <Card
                key={person._id}
                className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => togglePersonSelection(person._id)}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => togglePersonSelection(person._id)}
                    className="mt-1"
                  />

                  {/* Face thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                    {faceCropUrl && (
                      <Image
                        src={faceCropUrl}
                        alt="Person"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">
                      Person #{person._id.slice(-6)}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        {person.photoCount}{" "}
                        {person.photoCount === 1 ? "photo" : "photos"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Quality: {Math.round(person.metadata.qualityScore)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {unlinkedPersons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No unlinked persons</p>
            <p className="text-sm mt-1">
              All persons have been linked to players
            </p>
          </div>
        )}
      </Card>

      {/* Merge Modal */}
      <MergePersonsModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        selectedPersonIds={selectedPersonIds}
        gamePersons={gamePersons}
        onMergeSuccess={handleMergeSuccess}
      />
    </>
  );
}
