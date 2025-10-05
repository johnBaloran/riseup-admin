// src/components/features/league/teams/EditTeamForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team edit form ONLY
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
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { updateTeamSchema, UpdateTeamInput } from "@/lib/validations/team";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditTeamFormProps {
  team: any;
  cityId: string;
  cities: any[];
}

export function EditTeamForm({ team, cityId, cities }: EditTeamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(
    typeof team.division?.city === "object"
      ? team.division.city._id
      : team.division?.city || cityId
  );
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [showMoveWarning, setShowMoveWarning] = useState(false);
  const [pendingDivisionChange, setPendingDivisionChange] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateTeamInput>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      id: team._id.toString(),
      teamName: team.teamName,
      teamNameShort: team.teamNameShort,
      teamCode: team.teamCode,
      division:
        typeof team.division === "object"
          ? team.division._id.toString()
          : team.division,
      teamCaptain: team.teamCaptain?._id?.toString() || null,
    },
  });

  const selectedDivision = watch("division");
  const selectedCaptain = watch("teamCaptain");

  // Filter locations by selected city
  const availableLocations = useMemo(() => {
    const city = cities.find((c) => c._id === selectedCity);
    return city?.locations || [];
  }, [cities, selectedCity]);

  // Fetch divisions when city changes
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

  // Fetch divisions when city changes
  useEffect(() => {
    if (selectedCity) {
      fetchDivisions(selectedCity);
    }
  }, [selectedCity]);

  const handleDivisionChange = (newDivisionId: string) => {
    const newDivision = divisions.find((d) => d._id === newDivisionId);
    const currentDivision = divisions.find((d) => d._id === selectedDivision);

    // Check if moving to different city
    if (
      newDivision &&
      currentDivision &&
      newDivision.city._id !== currentDivision.city._id
    ) {
      setPendingDivisionChange(newDivisionId);
      setShowMoveWarning(true);
    } else {
      setValue("division", newDivisionId, { shouldValidate: true });
    }
  };

  const confirmDivisionChange = () => {
    if (pendingDivisionChange) {
      setValue("division", pendingDivisionChange, { shouldValidate: true });
      const newDivision = divisions.find(
        (d) => d._id === pendingDivisionChange
      );
      if (newDivision) {
        setSelectedCity(newDivision.city._id);
      }
    }
    setShowMoveWarning(false);
    setPendingDivisionChange(null);
  };

  const onSubmit = async (data: UpdateTeamInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/${cityId}/teams`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update team");
      }

      toast.success("Team updated successfully!");
      router.push(`/admin/${cityId}/league/teams/${team._id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update team");
      console.error("Update team error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast.error("Please fill in all required fields");
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* Division */}
        <Card>
          <CardHeader>
            <CardTitle>Division</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="division">Division *</Label>
              <Select
                value={selectedDivision}
                onValueChange={handleDivisionChange}
                disabled={isLoading || loadingDivisions}
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
                      {division.divisionName} ({division.city?.cityName})
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
                disabled={isLoading}
                onChange={(e) => {
                  const upper = e.target.value.toUpperCase();
                  setValue("teamCode", upper);
                }}
              />
              {errors.teamCode && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.teamCode.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Must be unique within the division
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Captain */}
        <Card>
          <CardHeader>
            <CardTitle>Team Captain</CardTitle>
          </CardHeader>
          <CardContent>
            {team.players && team.players.length > 0 ? (
              <div>
                <Label htmlFor="teamCaptain">Select Captain</Label>
                <Select
                  value={selectedCaptain || "none"}
                  onValueChange={(value) =>
                    setValue("teamCaptain", value === "none" ? null : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No captain assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No captain</SelectItem>
                    {team.players.map((player: any) => (
                      <SelectItem
                        key={player._id}
                        value={player._id.toString()}
                      >
                        {player.playerName}
                        {player.jerseyNumber && ` (#${player.jerseyNumber})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedCaptain && (
                  <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      No captain assigned. Consider assigning a team captain.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                Add players to the roster before assigning a captain.
              </div>
            )}
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
              "Update Team"
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

      {/* Move Team Warning Dialog */}
      <AlertDialog open={showMoveWarning} onOpenChange={setShowMoveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Team to Different City?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDivisionChange && (
                <>
                  You are moving this team from{" "}
                  <strong>
                    {
                      divisions.find((d) => d._id === selectedDivision)?.city
                        ?.cityName
                    }
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {
                      divisions.find((d) => d._id === pendingDivisionChange)
                        ?.city?.cityName
                    }
                  </strong>
                  . All stats and history will be preserved.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDivisionChange(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDivisionChange}>
              Confirm Move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
