// src/components/features/league/teams/CreateTeamForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team creation form ONLY
 */

"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { createTeamSchema, CreateTeamInput } from "@/lib/validations/team";

interface CreateTeamFormProps {
  cities: any[];
  prefilledDivision?: any;
}

export function CreateTeamForm({ cities, prefilledDivision }: CreateTeamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(
    prefilledDivision?.city?._id || cities[0]?._id || ""
  );
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      city: prefilledDivision?.city?._id || cities[0]?._id || "",
      location: prefilledDivision?.location?._id || "",
      division: prefilledDivision?._id || "",
    },
  });

  const selectedLocation = watch("location");
  const selectedDivision = watch("division");

  // Filter locations by selected city
  const availableLocations = useMemo(() => {
    const city = cities.find((c) => c._id === selectedCity);
    return city?.locations || [];
  }, [cities, selectedCity]);

  // Fetch divisions when location changes (active/register only)
  const fetchDivisions = async (locationId?: string) => {
    if (!locationId) {
      setDivisions([]);
      return;
    }

    setLoadingDivisions(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        location: locationId,
        tab: "active", // Only fetch active or register divisions
      });

      const response = await fetch(`/api/v1/divisions?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setDivisions(result.data.divisions || []);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
      setDivisions([]);
    } finally {
      setLoadingDivisions(false);
    }
  };

  // Initialize with prefilled division on mount
  useEffect(() => {
    if (prefilledDivision) {
      // Fetch divisions for the prefilled location
      if (prefilledDivision.location?._id) {
        fetchDivisions(prefilledDivision.location._id);
      }
    }
  }, []); // Only run on mount

  // Fetch divisions when location changes
  useMemo(() => {
    if (selectedLocation) {
      fetchDivisions(selectedLocation);
    } else {
      setDivisions([]);
    }
  }, [selectedLocation]);

  const onSubmit = async (data: CreateTeamInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create team");
      }

      toast.success("Team created successfully!");
      router.push(`/admin/league/teams/${result.data._id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create team");
      console.error("Create team error:", err);
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
      {/* Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
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
                setValue("division", "", { shouldValidate: false });
                setDivisions([]);
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={"Select city"} />
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
              onValueChange={(value) => {
                setValue("location", value, { shouldValidate: true });
                setValue("division", "", { shouldValidate: false });
              }}
              disabled={
                isLoading || !selectedCity || availableLocations.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedCity
                      ? "Select city first"
                      : availableLocations.length === 0
                      ? "No locations available"
                      : "Select location"
                  }
                />
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
            {!selectedCity && (
              <p className="text-sm text-gray-500 mt-1">
                Please select a city first to see available locations.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="division">Division *</Label>
            <Select
              value={selectedDivision}
              onValueChange={(value) =>
                setValue("division", value, { shouldValidate: true })
              }
              disabled={
                isLoading ||
                loadingDivisions ||
                !selectedLocation ||
                divisions.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedLocation
                      ? "Select location first"
                      : loadingDivisions
                      ? "Loading divisions..."
                      : divisions.length === 0
                      ? "No active divisions available"
                      : "Select division"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division: any) => (
                  <SelectItem key={division._id} value={division._id}>
                    {division.divisionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.division && (
              <p className="text-sm text-red-600 mt-1">
                {errors.division.message}
              </p>
            )}
            {!selectedLocation && (
              <p className="text-sm text-gray-500 mt-1">
                Please select a location first to see available divisions.
              </p>
            )}
            {!loadingDivisions &&
              divisions.length === 0 &&
              selectedLocation && (
                <p className="text-sm text-gray-500 mt-1">
                  No active divisions available for this location.
                </p>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Team Information */}
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="teamName">Team Name *</Label>
            <Input
              {...register("teamName")}
              id="teamName"
              placeholder="Toronto Raptors"
              disabled={isLoading}
            />
            {errors.teamName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.teamName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="teamNameShort">Team Name Short *</Label>
            <Input
              {...register("teamNameShort")}
              id="teamNameShort"
              placeholder="Raptors"
              disabled={isLoading}
            />
            {errors.teamNameShort && (
              <p className="text-sm text-red-600 mt-1">
                {errors.teamNameShort.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="teamCode">Team Code *</Label>
            <Input
              {...register("teamCode")}
              id="teamCode"
              placeholder="aBcd123"
              disabled={isLoading}
              onChange={(e) => {
                setValue("teamCode", e.target.value);
              }}
            />
            {errors.teamCode && (
              <p className="text-sm text-red-600 mt-1">
                {errors.teamCode.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Message */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">What happens after creation:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Add players to the roster</li>
            <li>Assign a team captain from the roster</li>
            <li>Configure jersey colors and design (in Jersey Management)</li>
            <li>Stats will update automatically as games are played</li>
          </ul>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Team"
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
