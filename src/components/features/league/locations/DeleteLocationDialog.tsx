// src/components/features/league/locations/DeleteLocationDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Delete location confirmation dialog ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Location {
  _id: string;
  name: string;
  address: string;
}

interface DeleteLocationDialogProps {
  location: Location;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLocationDialog({
  location,
  open,
  onOpenChange,
}: DeleteLocationDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/v1/league/locations?id=${location._id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete location");
      }

      toast.success("Location deleted successfully");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete location");
      console.error("Delete location error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Location</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{location.name}</span>?
            <br />
            <br />
            This action cannot be undone. You can only delete locations that
            have no active divisions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Location"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
