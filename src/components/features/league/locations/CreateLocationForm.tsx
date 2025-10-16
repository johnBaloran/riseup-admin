// src/components/features/league/locations/CreateLocationForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Location creation form ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  createLocationSchema,
  CreateLocationInput,
} from "@/lib/validations/location";

interface City {
  _id: string;
  cityName: string;
  region: string;
  country: string;
}

interface CreateLocationFormProps {
  cities: City[];
  cityId: string;
}

export function CreateLocationForm({
  cities,
  cityId,
}: CreateLocationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateLocationInput>({
    resolver: zodResolver(createLocationSchema),
  });

  const selectedCity = watch("city");

  const onSubmit = async (data: CreateLocationInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/league/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create location");
      }

      toast.success("Location created successfully!");
      router.push(`/league/locations`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create location");
      console.error("Create location error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast.error("Please fill in all required fields");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-6 bg-white p-6 rounded-lg shadow"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Select
            value={selectedCity}
            onValueChange={(value) =>
              setValue("city", value, { shouldValidate: true })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city._id} value={city._id}>
                  {city.cityName}, {city.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="name">Location Name *</Label>
          <Input
            {...register("name")}
            id="name"
            placeholder="Downtown Community Center"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address *</Label>
          <Input
            {...register("address")}
            id="address"
            placeholder="123 Main Street, City, State 12345"
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
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                {...register("coordinates.latitude", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                })}
                id="latitude"
                type="number"
                step="any"
                placeholder="43.6532"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                {...register("coordinates.longitude", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                })}
                id="longitude"
                type="number"
                step="any"
                placeholder="-79.3832"
                disabled={isLoading}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Add coordinates for map integration (optional)
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Location"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
