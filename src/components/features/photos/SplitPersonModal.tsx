"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Split,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Photo {
  _id: string;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
  detectedFaces?: Array<{
    personId?: string;
    confidence?: number;
    boundingBox?: any;
  }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personFaceCropUrl: string;
  onSplitSuccess: () => void;
}

export function SplitPersonModal({
  isOpen,
  onClose,
  personId,
  personFaceCropUrl,
  onSplitSuccess,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [splitting, setSplitting] = useState(false);

  // Fetch photos for this person when modal opens
  useEffect(() => {
    if (isOpen && personId) {
      fetchPersonPhotos();
    } else {
      // Reset when modal closes
      setPhotos([]);
      setSelectedPhotoIds(new Set());
    }
  }, [isOpen, personId]);

  const fetchPersonPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/person/${personId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch person photos");
      }

      const result = await response.json();

      setPhotos(result.data.photos || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load photos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  console.log("Fetched person photos:", photos);

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleSplit = async () => {
    if (selectedPhotoIds.size === 0) {
      toast.error("Please select at least one photo to split");
      return;
    }

    if (selectedPhotoIds.size === photos.length) {
      toast.error(
        "Cannot split all photos. At least one photo must remain with the original person."
      );
      return;
    }

    try {
      setSplitting(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/split`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personId,
            photoIds: Array.from(selectedPhotoIds),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to split person");
      }

      const result = await response.json();

      toast.success(
        `Successfully split person. Created new person with ${
          selectedPhotoIds.size
        } photo${selectedPhotoIds.size > 1 ? "s" : ""}.`
      );

      onSplitSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSplitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Split className="w-5 h-5" />
            Split Person
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Select photos to split into a new person. The selected photos will
            be moved to a new person record.
          </p>
        </DialogHeader>

        {/* Person Info */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0">
            {personFaceCropUrl && (
              <Image
                src={personFaceCropUrl}
                alt="Person"
                width={48}
                height={48}
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              Person ID: {personId.slice(-8)}
            </p>
            <p className="text-xs text-gray-600">
              {photos.length} total photo{photos.length !== 1 ? "s" : ""} •{" "}
              {selectedPhotoIds.size} selected
            </p>
          </div>
        </div>

        {/* Warning */}
        {selectedPhotoIds.size > 0 &&
          selectedPhotoIds.size === photos.length && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                You cannot split all photos. At least one photo must remain with
                the original person.
              </p>
            </div>
          )}

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No photos found</p>
              <p className="text-sm mt-1">
                This person has no associated photos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {photos.map((photo) => {
                const isSelected = selectedPhotoIds.has(photo._id);

                return (
                  <div
                    key={photo._id}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => togglePhotoSelection(photo._id)}
                  >
                    <Image
                      src={photo.url}
                      alt="Game photo"
                      fill
                      className="object-cover"
                    />

                    {/* Checkbox */}
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Upload date */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs p-1 text-center">
                      {new Date(photo.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={splitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSplit}
            disabled={
              splitting ||
              selectedPhotoIds.size === 0 ||
              selectedPhotoIds.size === photos.length
            }
          >
            {splitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Splitting...
              </>
            ) : (
              <>
                <Split className="w-4 h-4 mr-2" />
                Split {selectedPhotoIds.size} Photo
                {selectedPhotoIds.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
