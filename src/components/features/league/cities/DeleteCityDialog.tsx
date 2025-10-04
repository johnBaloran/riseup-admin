// src/components/features/league/cities/DeleteCityDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Delete city confirmation dialog ONLY
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
import { ICity } from "@/models/City";

interface DeleteCityDialogProps {
  city: ICity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCityDialog({
  city,
  open,
  onOpenChange,
}: DeleteCityDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/league/cities?id=${city._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete city");
      }

      toast.success("City deleted successfully");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete city");
      console.error("Delete city error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete City</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {city.cityName}, {city.region}, {city.country}
            </span>
            ? This action cannot be undone.
            <br />
            <br />
            Note: Existing divisions, teams, and games will not be affected.
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
              "Delete City"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
