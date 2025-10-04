// src/components/features/league/locations/EditLocationDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Edit location dialog ONLY
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createLocationSchema,
  CreateLocationInput,
} from "@/lib/validations/location";

interface Location {
  _id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

interface City {
  _id: string;
  cityName: string;
}

interface EditLocationDialogProps {
  location: Location;
  cities: City[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLocationDialog({
  location,
  cities,
  open,
  onOpenChange,
}: EditLocationDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<CreateLocationInput, "city">>({
    resolver: zodResolver(createLocationSchema.omit({ city: true })),
    defaultValues: {
      name: location.name,
      address: location.address,
      coordinates: location.coordinates,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: location.name,
        address: location.address,
        coordinates: location.coordinates,
      });
    }
  }, [open, location, reset]);

  const onSubmit = async (data: Omit<CreateLocationInput, "city">) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/league/locations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: location._id,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update location");
      }

      toast.success("Location updated successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update location");
      console.error("Update location error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
          <DialogDescription>Update location information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Location Name *</Label>
            <Input {...register("name")} id="edit-name" disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-address">Address *</Label>
            <Input
              {...register("address")}
              id="edit-address"
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Coordinates (Optional)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  {...register("coordinates.latitude", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                  })}
                  id="edit-latitude"
                  type="number"
                  step="any"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  {...register("coordinates.longitude", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                  })}
                  id="edit-longitude"
                  type="number"
                  step="any"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
