// src/components/features/league/players/EditPlayerInfoDialog.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface EditPlayerInfoDialogProps {
  player: any;
}

export function EditPlayerInfoDialog({ player }: EditPlayerInfoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    playerName: player.playerName || "",
    instagram: player.instagram || "",
    jerseyNumber: player.jerseyNumber ?? "",
    jerseySize: player.jerseySize || "",
    jerseyName: player.jerseyName || "",
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.playerName) {
      toast.error("Player name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/v1/players`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: player._id,
          playerName: formData.playerName,
          instagram: formData.instagram || null,
          jerseyNumber: formData.jerseyNumber === "" ? null : Number(formData.jerseyNumber),
          jerseySize: formData.jerseySize || null,
          jerseyName: formData.jerseyName || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update player");
      }

      toast.success("Player information updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating player:", error);
      toast.error(error.message || "Failed to update player");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Info
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Player Information</DialogTitle>
          <DialogDescription>
            Update the player's basic information and jersey details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="playerName">Player Name *</Label>
            <Input
              id="playerName"
              value={formData.playerName}
              onChange={(e) => handleChange("playerName", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={formData.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              placeholder="@username"
              disabled={isSubmitting}
            />
          </div>

          {/* Jersey Information */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Jersey Information</h4>

            <div className="space-y-4">
              <div>
                <Label htmlFor="jerseyNumber">Jersey Number</Label>
                <Input
                  id="jerseyNumber"
                  type="number"
                  min="0"
                  max="99"
                  value={formData.jerseyNumber}
                  onChange={(e) => handleChange("jerseyNumber", e.target.value)}
                  disabled={isSubmitting}
                  placeholder="0-99"
                />
              </div>

              <div>
                <Label htmlFor="jerseySize">Jersey Size</Label>
                <Select
                  value={formData.jerseySize || "none"}
                  onValueChange={(value) =>
                    handleChange("jerseySize", value === "none" ? "" : value)
                  }
                  disabled={isSubmitting}
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
                  id="jerseyName"
                  value={formData.jerseyName}
                  onChange={(e) => handleChange("jerseyName", e.target.value)}
                  placeholder="DOE"
                  disabled={isSubmitting}
                />
              </div>
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
