// src/components/features/league/players/EditPlayerForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player edit form ONLY
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
import {
  updatePlayerSchema,
  UpdatePlayerInput,
} from "@/lib/validations/player";
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
import { UserSearchSelect } from "./UserSearchSelect";

interface EditPlayerFormProps {
  player: any;
  cityId: string;
  cities: any[];
}

export function EditPlayerForm({
  player,
  cityId,
  cities,
}: EditPlayerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(
    typeof player.division?.city === "object"
      ? player.division.city._id
      : player.division?.city || cityId
  );
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [showDivisionChangeWarning, setShowDivisionChangeWarning] =
    useState(false);
  const [pendingDivisionChange, setPendingDivisionChange] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdatePlayerInput>({
    resolver: zodResolver(updatePlayerSchema),
    defaultValues: {
      id: player._id.toString(),
      playerName: player.playerName,
      division:
        typeof player.division === "object"
          ? player.division._id.toString()
          : player.division,
      team: player.team?._id?.toString() || null,
      jerseyNumber: player.jerseyNumber || null,
      jerseySize: player.jerseySize || null,
      jerseyName: player.jerseyName || null,
      instagram: player.instagram || null,
      user: player.user?._id?.toString() || null,
    },
  });

  const selectedDivision = watch("division");
  const selectedTeam = watch("team");

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
      setShowDivisionChangeWarning(true);
    } else {
      setValue("division", newDivisionId, { shouldValidate: true });
      setValue("team", null, { shouldValidate: false });
    }
  };

  const confirmDivisionChange = () => {
    if (pendingDivisionChange) {
      setValue("division", pendingDivisionChange, { shouldValidate: true });
      setValue("team", null, { shouldValidate: false });
      const newDivision = divisions.find(
        (d) => d._id === pendingDivisionChange
      );
      if (newDivision) {
        setSelectedCity(newDivision.city._id);
      }
    }
    setShowDivisionChangeWarning(false);
    setPendingDivisionChange(null);
  };

  const onSubmit = async (data: UpdatePlayerInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/${cityId}/players/${player._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update player");
      }

      toast.success("Player updated successfully!");
      router.push(`/league/players/${player._id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update player");
      console.error("Update player error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast.error("Please check the form for errors");
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* Division Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Division & Team</CardTitle>
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

            <div>
              <Label htmlFor="team">Team</Label>
              <Select
                value={selectedTeam || "none"}
                onValueChange={(value) =>
                  setValue("team", value === "none" ? null : value)
                }
                disabled={isLoading || loadingTeams || !selectedDivision}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingTeams ? "Loading..." : "Free agent"}
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
                disabled={isLoading}
              />
              {errors.playerName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.playerName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
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
                  value={watch("jerseySize") || "none"}
                  onValueChange={(value) =>
                    setValue(
                      "jerseySize",
                      value === "none"
                        ? null
                        : (value as "S" | "M" | "L" | "XL" | "2XL")
                    )
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
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

        {/* User Account Link */}
        <Card>
          <CardHeader>
            <CardTitle>User Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {watch("user") ? (
              <div>
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Linked to User Account
                    </p>
                    <p className="text-sm text-green-700">
                      {(player.user as any)?.email || "User email"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("user", null)}
                    disabled={isLoading}
                  >
                    Unlink
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Unlinking will not delete the user account, only remove the
                  connection to this player profile.
                </p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500">
                    No user account linked to this player
                  </p>
                </div>
                <div className="mt-3">
                  <Label htmlFor="userLink">Link to Existing User</Label>
                  <UserSearchSelect
                    onSelectUser={(userId) => setValue("user", userId)}
                    disabled={isLoading}
                    cityId={cityId}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Search by email to link this player to an existing user
                    account
                  </p>
                </div>
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
              "Update Player"
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

      {/* Division Change Warning Dialog */}
      <AlertDialog
        open={showDivisionChangeWarning}
        onOpenChange={setShowDivisionChangeWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Player Division?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDivisionChange && (
                <>
                  You are moving this player from{" "}
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
                  . The player will be removed from their current team and
                  become a free agent.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDivisionChange(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDivisionChange}>
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
