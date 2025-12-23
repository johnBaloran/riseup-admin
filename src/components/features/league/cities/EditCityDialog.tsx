// src/components/features/league/cities/EditCityDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Edit city dialog ONLY
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCitySchema, CreateCityInput } from "@/lib/validations/city";
import { ICity } from "@/models/City";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

interface EditCityDialogProps {
  city: ICity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCityDialog({
  city,
  open,
  onOpenChange,
}: EditCityDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    city.timezone
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCityInput>({
    resolver: zodResolver(createCitySchema),
    defaultValues: {
      cityName: city.cityName,
      stripeAccountId: city.stripeAccountId || "",
      region: city.region,
      country: city.country,
      timezone: city.timezone,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        cityName: city.cityName,
        stripeAccountId: city.stripeAccountId || "",
        region: city.region,
        country: city.country,
        timezone: city.timezone,
      });
      setSelectedTimezone(city.timezone);
    }
  }, [open, city, reset]);

  const onSubmit = async (data: CreateCityInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/league/cities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: city._id,
          ...data,
          timezone: selectedTimezone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update city");
      }

      toast.success("City updated successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update city");
      console.error("Update city error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit City</DialogTitle>
          <DialogDescription>Update city information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-cityName">City Name *</Label>
            <Input
              {...register("cityName")}
              id="edit-cityName"
              disabled={isLoading}
            />
            {errors.cityName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.cityName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-stripeAccountId">Stripe Account ID (Optional)</Label>
            <Input
              {...register("stripeAccountId")}
              id="edit-stripeAccountId"
              placeholder="acct_xxxxx"
              disabled={isLoading}
            />
            {errors.stripeAccountId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stripeAccountId.message}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Stripe account ID for webhook routing (e.g., acct_1Sa2AhHytqyWH4aT)
            </p>
          </div>

          <div>
            <Label htmlFor="edit-region">Region/State *</Label>
            <Input
              {...register("region")}
              id="edit-region"
              disabled={isLoading}
            />
            {errors.region && (
              <p className="text-sm text-red-600 mt-1">
                {errors.region.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-country">Country *</Label>
            <Input
              {...register("country")}
              id="edit-country"
              disabled={isLoading}
            />
            {errors.country && (
              <p className="text-sm text-red-600 mt-1">
                {errors.country.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-timezone">Timezone *</Label>
            <Select
              value={selectedTimezone}
              onValueChange={setSelectedTimezone}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
