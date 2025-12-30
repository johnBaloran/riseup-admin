// src/components/features/admins/CreateAdminForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admin creation form ONLY
 */

// src/components/features/admins/CreateAdminForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import TutorialLink from "@/components/features/tutorials/TutorialLink";

const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number"),
  phoneNumber: z.string().optional(),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export function CreateAdminForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  const onSubmit = async (data: CreateAdminFormData) => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          role: selectedRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create admin");
      }

      toast.success("Admin created successfully!");
      router.push(`/settings/admins`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create admin");
      console.error("Create admin error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Add Staff Member</h1>
          <TutorialLink tutorialId="adding-new-staff" />
        </div>
        <p className="text-gray-600 mt-1">Create a new admin account with role and permissions</p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input {...register("name")} id="name" disabled={isLoading} />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            {...register("email")}
            id="email"
            type="email"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            {...register("password")}
            id="password"
            type="password"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            {...register("phoneNumber")}
            id="phoneNumber"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="role">Role *</Label>
        <Select
          value={selectedRole}
          onValueChange={setSelectedRole}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXECUTIVE">Executive</SelectItem>
            <SelectItem value="COMMISSIONER">Commissioner</SelectItem>
            <SelectItem value="SCOREKEEPER">Scorekeeper</SelectItem>
            <SelectItem value="PHOTOGRAPHER">Photographer</SelectItem>
          </SelectContent>
        </Select>
        {!selectedRole && (
          <p className="text-sm text-gray-600 mt-1">Please select a role</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !selectedRole}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Admin"
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
    </>
  );
}
