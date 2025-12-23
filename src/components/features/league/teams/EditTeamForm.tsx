// src/components/features/league/teams/EditTeamForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team edit form ONLY
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { updateTeamSchema, UpdateTeamInput } from "@/lib/validations/team";

interface EditTeamFormProps {
  team: any;
  cityId: string;
  cities: any[];
}

export function EditTeamForm({ team, cityId, cities }: EditTeamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      teamCaptain: team.teamCaptain?._id?.toString() || null,
    },
  });

  const selectedCaptain = watch("teamCaptain");

  const onSubmit = async (data: UpdateTeamInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/teams`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update team");
      }

      toast.success("Team updated successfully!");
      router.push(`/league/teams/${team._id}`);
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
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
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
  );
}
