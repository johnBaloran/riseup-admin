// src/components/features/league/levels/CreateLevelForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Level creation form ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createLevelSchema, CreateLevelInput } from "@/lib/validations/level";

export function CreateLevelForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLevelInput>({
    resolver: zodResolver(createLevelSchema),
  });

  const onSubmit = async (data: CreateLevelInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/league/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create level");
      }

      toast.success("Level created successfully!");
      router.push(`/admin/league/levels`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create level");
      console.error("Create level error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast.error("Please fill in all required fields");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-6 bg-white p-6 rounded-lg shadow"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Level Name *</Label>
          <Input
            {...register("name")}
            id="name"
            placeholder="Elite / Competitive / Recreational"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="grade">Grade *</Label>
          <Input
            {...register("grade", { valueAsNumber: true })}
            id="grade"
            type="number"
            min="1"
            placeholder="1"
            disabled={isLoading}
          />
          {errors.grade && (
            <p className="text-sm text-red-600 mt-1">{errors.grade.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Grade 1 = Highest skill level. Each grade must be unique.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Level"
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
