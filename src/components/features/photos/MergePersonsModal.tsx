"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, GitMerge, AlertTriangle, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { GamePersonsResponse } from "@/types/faceRecognition";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPersonIds: string[];
  gamePersons: GamePersonsResponse;
  onMergeSuccess: () => void;
}

export function MergePersonsModal({
  isOpen,
  onClose,
  selectedPersonIds,
  gamePersons,
  onMergeSuccess,
}: Props) {
  const [primaryPersonId, setPrimaryPersonId] = useState<string>("");
  const [merging, setMerging] = useState(false);

  // Get selected persons data
  const selectedPersons = gamePersons.persons.filter((person) =>
    selectedPersonIds.includes(person._id)
  );

  // Auto-select the person with highest photo count as primary
  useState(() => {
    if (selectedPersons.length > 0 && !primaryPersonId) {
      const personWithMostPhotos = selectedPersons.reduce((prev, current) =>
        current.photoCount > prev.photoCount ? current : prev
      );
      setPrimaryPersonId(personWithMostPhotos._id);
    }
  });

  const handleMerge = async () => {
    if (!primaryPersonId) {
      toast.error("Please select a primary person");
      return;
    }

    const secondaryPersonIds = selectedPersonIds.filter(
      (id) => id !== primaryPersonId
    );

    if (secondaryPersonIds.length === 0) {
      toast.error("Please select at least one secondary person to merge");
      return;
    }

    try {
      setMerging(true);

      // Merge persons one by one into the primary
      for (const secondaryId of secondaryPersonIds) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/merge`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              primaryPersonId,
              secondaryPersonId: secondaryId,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to merge persons");
        }
      }

      toast.success(
        `Successfully merged ${secondaryPersonIds.length} person${
          secondaryPersonIds.length > 1 ? "s" : ""
        }`
      );

      onMergeSuccess();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setMerging(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5" />
            Merge Duplicate Persons
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning banner */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important: This action cannot be undone</p>
              <p className="text-xs text-amber-700 mt-1">
                All photos from secondary persons will be transferred to the
                primary person. Secondary person records will be deleted.
              </p>
            </div>
          </div>

          {/* Person selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Select Primary Person
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              The primary person will keep all photos from the merged persons.
              Photos from secondary persons will be reassigned to the primary.
            </p>

            <RadioGroup value={primaryPersonId} onValueChange={setPrimaryPersonId}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedPersons.map((person) => {
                  const isPrimary = primaryPersonId === person._id;

                  return (
                    <div
                      key={person._id}
                      className={`relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isPrimary
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPrimaryPersonId(person._id)}
                    >
                      <RadioGroupItem
                        value={person._id}
                        id={person._id}
                        className="mt-1"
                      />

                      {/* Face thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100">
                        {person.faceCropUrl && (
                          <Image
                            src={person.faceCropUrl}
                            alt="Person"
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={person._id}
                          className="text-xs text-gray-500 cursor-pointer"
                        >
                          #{person._id.slice(-6)}
                        </Label>
                        <div className="space-y-1 mt-1">
                          <p className="text-sm font-medium text-gray-700">
                            {person.photoCount}{" "}
                            {person.photoCount === 1 ? "photo" : "photos"}
                          </p>
                          <p className="text-xs text-gray-400">
                            Quality: {Math.round(person.metadata.qualityScore)}
                          </p>
                        </div>
                      </div>

                      {isPrimary && (
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                            <Check className="w-3 h-3" />
                            Primary
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Merge Summary
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                • <strong>{selectedPersons.length}</strong> persons selected
              </p>
              <p>
                • <strong>
                  {selectedPersons.reduce(
                    (sum, person) => sum + person.photoCount,
                    0
                  )}
                </strong>{" "}
                total photos will belong to the primary person
              </p>
              <p>
                • <strong>{selectedPersons.length - 1}</strong> person
                {selectedPersons.length - 1 > 1 ? "s" : ""} will be deleted
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={merging}>
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={merging || !primaryPersonId}
            className="gap-2"
          >
            {merging ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <GitMerge className="w-4 h-4" />
                Merge Persons
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
