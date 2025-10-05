// src/components/features/league/players/CreatePlayerForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player creation form ONLY
 */

"use client";

import { useState, useEffect } from "react"; // Changed: Remove useMemo, add useEffect
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
import {
  CreatePlayerInput,
  createPlayerSchema,
} from "@/lib/validations/player";
import { formatTime } from "@/lib/utils/time";

interface CreatePlayerFormProps {
  cityId: string;
  cities: any[];
}

export function CreatePlayerForm({ cityId, cities }: CreatePlayerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(cityId);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
  });

  const selectedDivision = watch("division");
  const selectedTeam = watch("team");

  // Define functions before using them
  const fetchDivisions = async (cityId: string) => {
    setLoadingDivisions(true);
    try {
      const response = await fetch(
        `/api/v1/${cityId}/divisions?page=1&limit=100`
      );
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

  const fetchTeams = async (divisionId: string) => {
    setLoadingTeams(true);
    try {
      const response = await fetch(
        `/api/v1/${selectedCity}/teams?division=${divisionId}&limit=100`
      );
      const result = await response.json();

      if (result.success) {
        setTeams(result.data.teams || []);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Fetch divisions when city changes
  useEffect(() => {
    if (selectedCity) {
      fetchDivisions(selectedCity);
    }
  }, [selectedCity]);

  // Fetch teams when division changes
  useEffect(() => {
    if (selectedDivision) {
      fetchTeams(selectedDivision);
    } else {
      setTeams([]);
    }
  }, [selectedDivision]);

  const onSubmit = async (data: CreatePlayerInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/${cityId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create player");
      }

      toast.success("Player created successfully!");
      router.push(`/admin/${cityId}/league/players/${result.data._id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create player");
      console.error("Create player error:", err);
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
      {/* Division Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Division Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Select
              value={selectedCity}
              onValueChange={(value) => {
                setSelectedCity(value);
                setValue("division", "", { shouldValidate: false });
                setValue("team", "", { shouldValidate: false });
                setDivisions([]);
                setTeams([]);
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
            <Label htmlFor="division">Division *</Label>
            <Select
              value={selectedDivision}
              onValueChange={(value) => {
                setValue("division", value, { shouldValidate: true });
                setValue("team", "", { shouldValidate: false });
              }}
              disabled={isLoading || loadingDivisions || divisions.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingDivisions ? "Loading..." : "Select division"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division: any) => (
                  <SelectItem key={division._id} value={division._id}>
                    {division.location?.name} - {division.divisionName}:{" "}
                    {division.day} {formatTime(division.startTime)} -{" "}
                    {formatTime(division.endTime)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.division && (
              <p className="text-sm text-red-600 mt-1">
                {errors.division.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="team">Team (Optional)</Label>
            <Select
              value={selectedTeam}
              onValueChange={(value) =>
                setValue("team", value === "none" ? undefined : value)
              }
              disabled={isLoading || loadingTeams || !selectedDivision}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingTeams ? "Loading..." : "Free agent (no team)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Free agent (no team)</SelectItem>
                {teams.map((team: any) => (
                  <SelectItem key={team._id} value={team._id}>
                    {team.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Leave as free agent or assign to a team in the selected division
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Player Information */}
      <Card>
        <CardHeader>
          <CardTitle>Player Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="playerName">Player Name *</Label>
            <Input
              {...register("playerName")}
              id="playerName"
              placeholder="John Doe"
              disabled={isLoading}
            />
            {errors.playerName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.playerName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="instagram">Instagram (Optional)</Label>
            <Input
              {...register("instagram")}
              id="instagram"
              placeholder="@username"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Jersey Information */}
      <Card>
        <CardHeader>
          <CardTitle>Jersey Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="jerseyNumber">Jersey Number</Label>
              <Input
                {...register("jerseyNumber", { valueAsNumber: true })}
                id="jerseyNumber"
                type="number"
                min="0"
                max="99"
                placeholder="23"
                disabled={isLoading}
              />
              {errors.jerseyNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.jerseyNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="jerseySize">Jersey Size</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "jerseySize",
                    value as "S" | "M" | "L" | "XL" | "2XL"
                  )
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Small</SelectItem>
                  <SelectItem value="M">Medium</SelectItem>
                  <SelectItem value="L">Large</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="2XL">2XL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jerseyName">Jersey Name</Label>
              <Input
                {...register("jerseyName")}
                id="jerseyName"
                placeholder="DOE"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Message */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">After creating this player:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Set up payment in Payment Management section</li>
            <li>Optionally link to an existing User account</li>
            <li>Player stats will be tracked automatically during games</li>
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
            "Create Player"
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
