// src/components/features/league/levels/EditLevelDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Edit level dialog ONLY
 */

"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateLevelSchema, UpdateLevelInput } from "@/lib/validations/level";

interface Level {
  _id: string;
  name: string;
  grade: number;
  active: boolean;
}

interface EditLevelDialogProps {
  level: Level;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLevelDialog({
  level,
  open,
  onOpenChange,
}: EditLevelDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateLevelInput>({
    resolver: zodResolver(updateLevelSchema),
    defaultValues: {
      id: level._id,
      name: level.name,
      grade: level.grade,
      active: level.active,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        id: level._id,
        name: level.name,
        grade: level.grade,
        active: level.active,
      });
    }
  }, [open, level, reset]);

  const activeValue = watch("active");

  const onSubmit = async (data: UpdateLevelInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/league/levels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update level");
      }

      toast.success("Level updated successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update level");
      console.error("Update level error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Level</DialogTitle>
          <DialogDescription>Update skill level information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Level Name *</Label>
            <Input {...register("name")} id="edit-name" disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-grade">Grade *</Label>
            <Input
              {...register("grade", { valueAsNumber: true })}
              id="edit-grade"
              type="number"
              min="1"
              disabled={isLoading}
            />
            {errors.grade && (
              <p className="text-sm text-red-600 mt-1">
                {errors.grade.message}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Grade 1 = Highest skill level. Each grade must be unique.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="edit-active">Active Status</Label>
              <p className="text-sm text-gray-500">
                Only active levels are shown when creating divisions
              </p>
            </div>
            <Switch
              id="edit-active"
              checked={activeValue}
              onCheckedChange={(checked) => setValue("active", checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
