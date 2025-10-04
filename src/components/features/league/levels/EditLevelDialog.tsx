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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLevelSchema, CreateLevelInput } from "@/lib/validations/level";

interface Level {
  _id: string;
  name: string;
  grade: number;
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
  } = useForm<CreateLevelInput>({
    resolver: zodResolver(createLevelSchema),
    defaultValues: {
      name: level.name,
      grade: level.grade,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: level.name,
        grade: level.grade,
      });
    }
  }, [open, level, reset]);

  const onSubmit = async (data: CreateLevelInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/league/levels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: level._id,
          ...data,
        }),
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
