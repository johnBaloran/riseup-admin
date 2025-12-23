// src/components/features/league/divisions/EditDivisionForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division edit form ONLY
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import {
  updateDivisionSchema,
  UpdateDivisionInput,
} from "@/lib/validations/division";
import { format, subDays } from "date-fns";
import { PopulatedDivision } from "@/types/division";
import { LeanCity } from "@/types/city";
import { LeanLevel } from "@/types/level";

interface EditDivisionFormProps {
  division: PopulatedDivision; // Will be PopulatedDivision from DB
  cities: LeanCity[];
  levels: LeanLevel[];
}

export function EditDivisionForm({
  division,
  cities,
  levels,
}: EditDivisionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(
    typeof division.city === "object" ? division.city._id : division.city
  );
  const [selectedStartDate, setSelectedStartDate] = useState<string>(
    division.startDate ? format(new Date(division.startDate), "yyyy-MM-dd") : ""
  );
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [prices, setPrices] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateDivisionInput>({
    resolver: zodResolver(updateDivisionSchema),
    defaultValues: {
      id: division._id.toString(),
      divisionName: division.divisionName,
      description: division.description,
      location:
        typeof division.location === "object"
          ? division.location._id.toString()
          : division.location,
      level:
        typeof division.level === "object"
          ? division.level._id.toString()
          : division.level,
      day: division.day as
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday", // Add type assertion
      startDate: division.startDate
        ? format(new Date(division.startDate), "yyyy-MM-dd")
        : undefined,
      startTime: division.startTime,
      endTime: division.endTime,
      earlyBirdDeadline: division.earlyBirdDeadline
        ? format(new Date(division.earlyBirdDeadline), "yyyy-MM-dd")
        : undefined,
      prices: {
        earlyBird:
          typeof division.prices?.earlyBird === "object"
            ? division.prices.earlyBird._id
            : division.prices?.earlyBird || "",
        regular:
          typeof division.prices?.regular === "object"
            ? division.prices.regular._id
            : division.prices?.regular || "",
        installment:
          typeof division.prices?.installment === "object"
            ? division.prices.installment._id
            : division.prices?.installment || "",
        regularInstallment:
          typeof division.prices?.regularInstallment === "object"
            ? division.prices.regularInstallment._id
            : division.prices?.regularInstallment || "",
        firstInstallment:
          typeof division.prices?.firstInstallment === "object"
            ? division.prices.firstInstallment._id
            : division.prices?.firstInstallment || "",
      },
      active: division.active,
      register: division.register,
    },
  });

  const selectedLocation = watch("location");
  const selectedLevel = watch("level");
  const selectedDay = watch("day");
  const active = watch("active");
  const registerOpen = watch("register");
  const selectedPrices = watch("prices");

  // Filter locations by selected city
  const availableLocations = useMemo(() => {
    const city = cities.find((c) => c._id === selectedCity);
    return city?.locations || [];
  }, [cities, selectedCity]);

  // Fetch prices for this city
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/v1/league/prices");
        if (response.ok) {
          const data = await response.json();
          // Filter prices to only show ones for this division's city or legacy (no city)
          const filteredPrices = (data.data || []).filter(
            (price: any) =>
              !price.city || price.city._id === selectedCity
          );
          setPrices(filteredPrices);
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    fetchPrices();
  }, [selectedCity]);

  // Group prices by type for easier selection
  const pricesByType = useMemo(() => {
    return {
      earlyBird: prices.filter((p) => p.type === "earlyBird"),
      regular: prices.filter((p) => p.type === "regular"),
      installment: prices.filter((p) => p.type === "installment"),
      regularInstallment: prices.filter((p) => p.type === "regularInstallment"),
      firstInstallment: prices.filter((p) => p.type === "firstInstallment"),
      free: prices.filter((p) => p.type === "free"),
    };
  }, [prices]);

  const earlyBirdDeadlineValue = watch("earlyBirdDeadline");

  // Calculate early bird end date - use earlyBirdDeadline if set, otherwise calculate from startDate
  const earlyBirdEndDate = useMemo(() => {
    if (earlyBirdDeadlineValue) {
      // Parse as local date to avoid timezone shift in preview
      const [year, month, day] = earlyBirdDeadlineValue.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    if (!selectedStartDate) return null;
    // Parse as local date to avoid timezone shift in preview
    const [year, month, day] = selectedStartDate.split("-").map(Number);
    const startDate = new Date(year, month - 1, day);
    return subDays(startDate, 42);
  }, [selectedStartDate, earlyBirdDeadlineValue]);

  const onSubmit = async (data: UpdateDivisionInput) => {
    setIsLoading(true);
    setConflictWarning(null);

    try {
      // Convert date strings to ISO format (like games do) to avoid timezone issues
      const payload = { ...data };
      if (payload.startDate) {
        const [year, month, day] = payload.startDate.split("-").map(Number);
        const localDate = new Date(year, month - 1, day);
        localDate.setHours(0, 0, 0, 0);
        payload.startDate = localDate.toISOString();
      }
      if (payload.earlyBirdDeadline) {
        const [year, month, day] = payload.earlyBirdDeadline.split("-").map(Number);
        const localDate = new Date(year, month - 1, day);
        localDate.setHours(0, 0, 0, 0);
        payload.earlyBirdDeadline = localDate.toISOString();
      }

      const response = await fetch(`/api/v1/divisions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update division");
      }

      // Show conflict warning if exists
      if (result.warning) {
        setConflictWarning(result.warning.message);
      }

      toast.success("Division updated successfully!");
      router.push(`/league/divisions/${data.id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update division");
      console.error("Update division error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast.error("Please fill in all required fields");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="divisionName">Division Name *</Label>
            <Input
              {...register("divisionName")}
              id="divisionName"
              disabled={isLoading}
            />
            {errors.divisionName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.divisionName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              {...register("description")}
              id="description"
              rows={3}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location & Level */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="city">City (Cannot be changed)</Label>
            <Select
              value={selectedCity}
              onValueChange={(value) => {
                setSelectedCity(value);
                // Reset location when city changes since locations are filtered by city
                setValue("location", "", { shouldValidate: false });
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city._id} value={city._id}>
                    {city.cityName}, {city.region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Select
              value={selectedLocation}
              onValueChange={(value) =>
                setValue("location", value, { shouldValidate: true })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map((location: any) => (
                  <SelectItem
                    key={location._id || location}
                    value={location._id || location}
                  >
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-sm text-red-600 mt-1">
                {errors.location.message}
              </p>
            )}
            {conflictWarning && (
              <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">{conflictWarning}</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="level">Skill Level *</Label>
            <Select
              value={selectedLevel}
              onValueChange={(value) =>
                setValue("level", value, { shouldValidate: true })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level: any) => (
                  <SelectItem key={level._id} value={level._id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-sm text-red-600 mt-1">
                {errors.level.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="day">Day *</Label>
            <Select
              value={selectedDay}
              onValueChange={(value) =>
                setValue("day", value as any, { shouldValidate: true })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
                <SelectItem value="Saturday">Saturday</SelectItem>
                <SelectItem value="Sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
            {errors.day && (
              <p className="text-sm text-red-600 mt-1">{errors.day.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                {...register("startDate")}
                id="startDate"
                type="date"
                disabled={isLoading}
                onChange={(e) => {
                  setSelectedStartDate(e.target.value);
                  setValue("startDate", e.target.value);
                }}
              />
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                {...register("startTime")}
                id="startTime"
                type="time"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                {...register("endTime")}
                id="endTime"
                type="time"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="earlyBirdDeadline">
              Early Bird Deadline (Optional)
            </Label>
            <Input
              {...register("earlyBirdDeadline")}
              id="earlyBirdDeadline"
              type="date"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              If not set, defaults to 42 days before start date
            </p>
          </div>

          {earlyBirdEndDate && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                {earlyBirdDeadlineValue ? (
                  <>
                    Early bird pricing ends on{" "}
                    <strong>{format(earlyBirdEndDate, "MMM dd, yyyy")}</strong>
                  </>
                ) : (
                  <>
                    Early bird pricing ends 42 days (6 weeks) before start date
                    on <strong>{format(earlyBirdEndDate, "MMM dd, yyyy")}</strong>
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <p className="text-sm text-gray-600">
            Select payment options for this division
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="earlyBird">Early Bird *</Label>
              <Select
                value={selectedPrices?.earlyBird}
                onValueChange={(value) =>
                  setValue("prices.earlyBird", value, { shouldValidate: true })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select early bird price" />
                </SelectTrigger>
                <SelectContent>
                  {pricesByType.earlyBird.map((price: any) => (
                    <SelectItem key={price._id} value={price._id}>
                      {price.name} - ${price.amount.toFixed(2)}
                      {price.city ? ` (${price.city.cityName})` : " (Legacy)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prices?.earlyBird && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.prices.earlyBird.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="regular">Regular *</Label>
              <Select
                value={selectedPrices?.regular}
                onValueChange={(value) =>
                  setValue("prices.regular", value, { shouldValidate: true })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select regular price" />
                </SelectTrigger>
                <SelectContent>
                  {pricesByType.regular.map((price: any) => (
                    <SelectItem key={price._id} value={price._id}>
                      {price.name} - ${price.amount.toFixed(2)}
                      {price.city ? ` (${price.city.cityName})` : " (Legacy)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prices?.regular && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.prices.regular.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="firstInstallment">Down Payment *</Label>
              <Select
                value={selectedPrices?.firstInstallment}
                onValueChange={(value) =>
                  setValue("prices.firstInstallment", value, {
                    shouldValidate: true,
                  })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select down payment price" />
                </SelectTrigger>
                <SelectContent>
                  {pricesByType.firstInstallment.map((price: any) => (
                    <SelectItem key={price._id} value={price._id}>
                      {price.name} - ${price.amount.toFixed(2)}
                      {price.city ? ` (${price.city.cityName})` : " (Legacy)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prices?.firstInstallment && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.prices.firstInstallment.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="installment">Weekly Installment (Early Bird) *</Label>
              <Select
                value={selectedPrices?.installment}
                onValueChange={(value) =>
                  setValue("prices.installment", value, {
                    shouldValidate: true,
                  })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select installment price" />
                </SelectTrigger>
                <SelectContent>
                  {pricesByType.installment.map((price: any) => (
                    <SelectItem key={price._id} value={price._id}>
                      {price.name} - ${price.amount.toFixed(2)}/week
                      {price.city ? ` (${price.city.cityName})` : " (Legacy)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prices?.installment && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.prices.installment.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="regularInstallment">
                Weekly Installment (Regular) *
              </Label>
              <Select
                value={selectedPrices?.regularInstallment}
                onValueChange={(value) =>
                  setValue("prices.regularInstallment", value, {
                    shouldValidate: true,
                  })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select regular installment price" />
                </SelectTrigger>
                <SelectContent>
                  {pricesByType.regularInstallment.map((price: any) => (
                    <SelectItem key={price._id} value={price._id}>
                      {price.name} - ${price.amount.toFixed(2)}/week
                      {price.city ? ` (${price.city.cityName})` : " (Legacy)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prices?.regularInstallment && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.prices.regularInstallment.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Info className="inline h-4 w-4 mr-1" />
              Prices are filtered to only show prices for{" "}
              <strong>
                {cities.find((c) => c._id === selectedCity)?.cityName}
              </strong>{" "}
              and legacy prices (without a city).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={active}
              onCheckedChange={(checked) =>
                setValue("active", checked as boolean)
              }
              disabled={isLoading}
            />
            <label
              htmlFor="active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active (Games are being played)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="register"
              checked={registerOpen}
              onCheckedChange={(checked) =>
                setValue("register", checked as boolean)
              }
              disabled={isLoading}
            />
            <label
              htmlFor="register"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Registration Open (Teams can join)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Division"
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
