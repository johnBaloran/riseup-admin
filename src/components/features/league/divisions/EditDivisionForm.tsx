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
import { Loader2, AlertCircle, Info, Lock } from "lucide-react";
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
      active: division.active,
      register: division.register,
    },
  });

  const selectedLocation = watch("location");
  const selectedLevel = watch("level");
  const selectedDay = watch("day");
  const active = watch("active");
  const registerOpen = watch("register");

  // Filter locations by selected city
  const availableLocations = useMemo(() => {
    const city = cities.find((c) => c._id === selectedCity);
    return city?.locations || [];
  }, [cities, selectedCity]);

  // Calculate early bird end date
  const earlyBirdEndDate = useMemo(() => {
    if (!selectedStartDate) return null;
    const startDate = new Date(selectedStartDate);
    return subDays(startDate, 42);
  }, [selectedStartDate]);

  const onSubmit = async (data: UpdateDivisionInput) => {
    setIsLoading(true);
    setConflictWarning(null);

    try {
      const response = await fetch(`/api/v1/divisions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      router.push(`/admin/league/divisions`);
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
                    {location.name || "Location"}
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
                    Grade {level.grade} - {level.name}
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

          {earlyBirdEndDate && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Early bird pricing ends 42 days (6 weeks) before start date on{" "}
                <strong>{format(earlyBirdEndDate, "MMM dd, yyyy")}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing (Locked) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Pricing (Locked)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Pricing cannot be changed after division creation
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <span className="text-xs text-gray-500">Early Bird</span>
                <p className="font-medium">
                  ${division.prices?.earlyBird?.amount?.toFixed(2) || "0.00"} -{" "}
                  {division.prices?.earlyBird?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Regular</span>
                <p className="font-medium">
                  ${division.prices?.regular?.amount?.toFixed(2) || "0.00"} -{" "}
                  {division.prices?.regular?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Down Payment</span>
                <p className="font-medium">
                  $
                  {division.prices?.firstInstallment?.amount?.toFixed(2) ||
                    "0.00"}{" "}
                  - {division.prices?.firstInstallment?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">
                  Weekly (Early Bird)
                </span>
                <p className="font-medium">
                  ${division.prices?.installment?.amount?.toFixed(2) || "0.00"}
                  /week - {division.prices?.installment?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Weekly (Regular)</span>
                <p className="font-medium">
                  $
                  {division.prices?.regularInstallment?.amount?.toFixed(2) ||
                    "0.00"}
                  /week - {division.prices?.regularInstallment?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Free</span>
                <p className="font-medium">
                  ${division.prices?.free?.amount?.toFixed(2) || "0.00"} -{" "}
                  {division.prices?.free?.name || "N/A"}
                </p>
              </div>
            </div>
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
