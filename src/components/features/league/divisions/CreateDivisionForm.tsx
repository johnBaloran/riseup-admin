// src/components/features/league/divisions/CreateDivisionForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Division creation form ONLY
 */

"use client";

import { useState, useMemo } from "react";
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
  createDivisionSchema,
  CreateDivisionInput,
} from "@/lib/validations/division";
import { format, subDays } from "date-fns";

interface City {
  _id: string;
  cityName: string;
  region: string;
  locations: any[];
}

interface Level {
  _id: string;
  name: string;
  grade: number;
}

interface Price {
  _id: string;
  name: string;
  amount: number;
  type: string;
}

interface CreateDivisionFormProps {
  cities: City[];
  levels: Level[];
  prices: Price[];
}

export function CreateDivisionForm({
  cities,
  levels,
  prices,
}: CreateDivisionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(cities[0]?._id || "");
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateDivisionInput>({
    resolver: zodResolver(createDivisionSchema),
    defaultValues: {
      city: cities[0]?._id || "",
      active: false,
      register: false,
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

  // Filter prices by type
  const pricesByType = useMemo(() => {
    return {
      earlyBird: prices.filter((p) => p.type === "earlyBird"),
      regular: prices.filter((p) => p.type === "regular"),
      installment: prices.filter((p) => p.type === "installment"),
      regularInstallment: prices.filter((p) => p.type === "regularInstallment"),
      firstInstallment: prices.filter((p) => p.type === "firstInstallment"),
    };
  }, [prices]);

  // Calculate early bird end date
  const earlyBirdEndDate = useMemo(() => {
    if (!selectedStartDate) return null;
    const startDate = new Date(selectedStartDate);
    return subDays(startDate, 42);
  }, [selectedStartDate]);

  const onSubmit = async (data: CreateDivisionInput) => {
    setIsLoading(true);
    setConflictWarning(null);

    try {
      const response = await fetch(`/api/v1/divisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create division");
      }

      // Show conflict warning if exists
      if (result.warning) {
        setConflictWarning(result.warning.message);
      }

      toast.success("Division created successfully!");
      router.push(`/admin/league/divisions`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create division");
      console.error("Create division error:", err);
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
              placeholder="Monday A Division - Elite"
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
              placeholder="Competitive league for experienced players..."
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
            <Label htmlFor="city">City *</Label>
            <Select
              value={selectedCity}
              onValueChange={(value) => {
                setSelectedCity(value);
                setValue("city", value, { shouldValidate: true });
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
            {errors.city && (
              <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Select
              value={selectedLocation}
              onValueChange={(value) =>
                setValue("location", value, { shouldValidate: true })
              }
              disabled={isLoading || availableLocations.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
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
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
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
                <SelectValue placeholder="Select day" />
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

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <p className="text-sm text-gray-600">
            All pricing options are required and cannot be changed later
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Single Payment */}
          <div>
            <h4 className="font-medium mb-3">Single Payment Options</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="earlyBird">Early Bird Price *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("prices.earlyBird", value, {
                      shouldValidate: true,
                    })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricesByType.earlyBird.map((price) => (
                      <SelectItem key={price._id} value={price._id}>
                        ${price.amount.toFixed(2)} - {price.name}
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
                <Label htmlFor="regular">Regular Price *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("prices.regular", value, { shouldValidate: true })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricesByType.regular.map((price) => (
                      <SelectItem key={price._id} value={price._id}>
                        ${price.amount.toFixed(2)} - {price.name}
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
            </div>
          </div>

          {/* Installment Payment */}
          <div>
            <h4 className="font-medium mb-3">Installment Payment Options</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="firstInstallment">Down Payment *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("prices.firstInstallment", value, {
                      shouldValidate: true,
                    })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricesByType.firstInstallment.map((price) => (
                      <SelectItem key={price._id} value={price._id}>
                        ${price.amount.toFixed(2)} - {price.name}
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
                <Label htmlFor="installment">Weekly (Early Bird) *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("prices.installment", value, {
                      shouldValidate: true,
                    })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricesByType.installment.map((price) => (
                      <SelectItem key={price._id} value={price._id}>
                        ${price.amount.toFixed(2)}/week - {price.name}
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
                <Label htmlFor="regularInstallment">Weekly (Regular) *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("prices.regularInstallment", value, {
                      shouldValidate: true,
                    })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricesByType.regularInstallment.map((price) => (
                      <SelectItem key={price._id} value={price._id}>
                        ${price.amount.toFixed(2)}/week - {price.name}
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
              Creating...
            </>
          ) : (
            "Create Division"
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
