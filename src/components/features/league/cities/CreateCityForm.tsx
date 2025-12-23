// src/components/features/league/cities/CreateCityForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * City creation form ONLY
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
import { createCitySchema, CreateCityInput } from "@/lib/validations/city";

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

export function CreateCityForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCityInput>({
    resolver: zodResolver(createCitySchema),
  });

  const selectedTimezone = watch("timezone");

  const onSubmit = async (data: CreateCityInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/league/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create city");
      }

      toast.success("City created successfully!");
      router.push("/league/cities");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create city");
      console.error("Create city error:", err);
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
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="cityName">City Name *</Label>
          <Input
            {...register("cityName")}
            id="cityName"
            placeholder="Toronto"
            disabled={isLoading}
          />
          {errors.cityName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.cityName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="stripeAccountId">Stripe Account ID (Optional)</Label>
          <Input
            {...register("stripeAccountId")}
            id="stripeAccountId"
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
          <Label htmlFor="region">Region/State *</Label>
          <Input
            {...register("region")}
            id="region"
            placeholder="Ontario"
            disabled={isLoading}
          />
          {errors.region && (
            <p className="text-sm text-red-600 mt-1">{errors.region.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Country *</Label>
          <Input
            {...register("country")}
            id="country"
            placeholder="Canada"
            disabled={isLoading}
          />
          {errors.country && (
            <p className="text-sm text-red-600 mt-1">
              {errors.country.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="timezone">Timezone *</Label>
          <Select
            value={selectedTimezone}
            onValueChange={(value) =>
              setValue("timezone", value, { shouldValidate: true })
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timezone && (
            <p className="text-sm text-red-600 mt-1">
              {errors.timezone.message}
            </p>
          )}
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
            "Create City"
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
