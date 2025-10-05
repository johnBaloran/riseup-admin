// src/components/features/league/teams/QuickCreatePlayerDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Quick create player and add to team dialog ONLY
 */

"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Simplified schema for quick create
const quickCreateSchema = z.object({
  playerName: z.string().min(2, "Player name must be at least 2 characters"),
  jerseyNumber: z
    .number()
    .min(0, "Jersey number must be 0 or greater")
    .max(99, "Jersey number must be 99 or less")
    .optional()
    .nullable(),
  jerseySize: z.enum(["S", "M", "L", "XL", "2XL"]).optional(),
});

type QuickCreateInput = z.infer<typeof quickCreateSchema>;

interface QuickCreatePlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: any;
  cityId: string;
  onSuccess: () => void;
}

export function QuickCreatePlayerDialog({
  open,
  onOpenChange,
  team,
  cityId,
  onSuccess,
}: QuickCreatePlayerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<QuickCreateInput>({
    resolver: zodResolver(quickCreateSchema),
  });

  const onSubmit = async (data: QuickCreateInput) => {
    setIsLoading(true);

    try {
      // Create player with team assignment
      const createPayload = {
        playerName: data.playerName,
        division:
          typeof team.division === "object" ? team.division._id : team.division,
        team: team._id,
        jerseyNumber: data.jerseyNumber,
        jerseySize: data.jerseySize,
      };

      const response = await fetch(`/api/v1/${cityId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create player");
      }

      toast.success("Player created and added to roster!");
      reset();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to create player");
      console.error("Quick create player error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Create Player</DialogTitle>
          <DialogDescription>
            Create a new player and add them to {team.teamName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Add to Roster"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
