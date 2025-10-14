// src/components/features/league/divisions/AddTeamDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Dialog for adding a team to a division
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const addTeamSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  teamNameShort: z.string().min(1, "Short team name is required"),
  teamCode: z.string().min(1, "Team code is required"),
});

type AddTeamInput = z.infer<typeof addTeamSchema>;

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  division: any;
}

export function AddTeamDialog({
  open,
  onOpenChange,
  division,
}: AddTeamDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddTeamInput>({
    resolver: zodResolver(addTeamSchema),
  });

  const onSubmit = async (data: AddTeamInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          city: division.city._id,
          location: division.location._id,
          division: division._id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create team");
      }

      toast.success("Team created successfully!");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create team");
      console.error("Create team error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Team to {division.divisionName}</DialogTitle>
          <DialogDescription>
            Create a new team in this division. Players can be added after
            creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            />
            {errors.teamCode && (
              <p className="text-sm text-red-600 mt-1">
                {errors.teamCode.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
