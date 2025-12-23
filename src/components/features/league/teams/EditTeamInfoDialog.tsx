// src/components/features/league/teams/EditTeamInfoDialog.tsx

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

interface EditTeamInfoDialogProps {
  team: any;
}

export function EditTeamInfoDialog({ team }: EditTeamInfoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teamName: team.teamName || "",
    teamNameShort: team.teamNameShort || "",
    teamCode: team.teamCode || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teamName || !formData.teamNameShort || !formData.teamCode) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/v1/teams`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: team._id,
          teamName: formData.teamName,
          teamNameShort: formData.teamNameShort,
          teamCode: formData.teamCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update team");
      }

      toast.success("Team information updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating team:", error);
      toast.error(error.message || "Failed to update team");
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
          <DialogTitle>Edit Team Information</DialogTitle>
          <DialogDescription>
            Update the team's basic information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="teamName">Team Name *</Label>
            <Input
              id="teamName"
              value={formData.teamName}
              onChange={(e) => handleChange("teamName", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="teamNameShort">Team Name Short *</Label>
            <Input
              id="teamNameShort"
              value={formData.teamNameShort}
              onChange={(e) => handleChange("teamNameShort", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="teamCode">Team Code *</Label>
            <Input
              id="teamCode"
              value={formData.teamCode}
              onChange={(e) => handleChange("teamCode", e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Must be unique within the division
            </p>
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
