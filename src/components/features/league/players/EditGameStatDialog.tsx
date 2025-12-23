// src/components/features/league/players/EditGameStatDialog.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface EditGameStatDialogProps {
  playerId: string;
  gameId: string;
  gameName: string;
  stat: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    threesMade: number;
    twosMade: number;
    freeThrowsMade: number;
  };
}

export function EditGameStatDialog({
  playerId,
  gameId,
  gameName,
  stat,
}: EditGameStatDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    points: stat.points ?? 0,
    rebounds: stat.rebounds ?? 0,
    assists: stat.assists ?? 0,
    steals: stat.steals ?? 0,
    blocks: stat.blocks ?? 0,
    threesMade: stat.threesMade ?? 0,
    twosMade: stat.twosMade ?? 0,
    freeThrowsMade: stat.freeThrowsMade ?? 0,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? 0 : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/v1/players/${playerId}/stats/${gameId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update stat");
      }

      toast.success("Stat updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating stat:", error);
      toast.error(error.message || "Failed to update stat");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Game Stats</DialogTitle>
          <DialogDescription>{gameName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => handleChange("points", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="rebounds">Rebounds</Label>
              <Input
                id="rebounds"
                type="number"
                min="0"
                value={formData.rebounds}
                onChange={(e) => handleChange("rebounds", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="assists">Assists</Label>
              <Input
                id="assists"
                type="number"
                min="0"
                value={formData.assists}
                onChange={(e) => handleChange("assists", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="steals">Steals</Label>
              <Input
                id="steals"
                type="number"
                min="0"
                value={formData.steals}
                onChange={(e) => handleChange("steals", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="blocks">Blocks</Label>
              <Input
                id="blocks"
                type="number"
                min="0"
                value={formData.blocks}
                onChange={(e) => handleChange("blocks", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="threesMade">3PM</Label>
              <Input
                id="threesMade"
                type="number"
                min="0"
                value={formData.threesMade}
                onChange={(e) => handleChange("threesMade", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="twosMade">2PM</Label>
              <Input
                id="twosMade"
                type="number"
                min="0"
                value={formData.twosMade}
                onChange={(e) => handleChange("twosMade", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="freeThrowsMade">FTM</Label>
              <Input
                id="freeThrowsMade"
                type="number"
                min="0"
                value={formData.freeThrowsMade}
                onChange={(e) => handleChange("freeThrowsMade", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
