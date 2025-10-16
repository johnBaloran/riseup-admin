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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ILocation } from "@/models/Location";

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

interface CreateAdminFormProps {
  locations: ILocation[];
  cityId: string;
}

export function CreateAdminForm({ locations, cityId }: CreateAdminFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  const needsLocationAssignment =
    selectedRole === "SCOREKEEPER" || selectedRole === "PHOTOGRAPHER";

  const onSubmit = async (data: CreateAdminFormData) => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (needsLocationAssignment && selectedLocations.length === 0) {
      toast.error("Please select at least one location");
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
          assignedLocations: needsLocationAssignment
            ? selectedLocations
            : undefined,
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

  const toggleLocation = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  return (
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
        {selectedRole && (
          <p className="text-sm text-gray-600 mt-1">
            {selectedRole === "EXECUTIVE" || selectedRole === "COMMISSIONER"
              ? "Full access to all locations"
              : "Must assign specific locations"}
          </p>
        )}
      </div>

      {needsLocationAssignment && (
        <div>
          <Label>Assigned Locations *</Label>
          <div className="mt-2 space-y-2 border rounded-lg p-4 max-h-48 overflow-y-auto">
            {locations.length === 0 ? (
              <p className="text-sm text-gray-500">
                No locations available in this city
              </p>
            ) : (
              locations.map((location) => (
                <div key={location._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={location._id}
                    checked={selectedLocations.includes(location._id)}
                    onCheckedChange={() => toggleLocation(location._id)}
                  />
                  <label
                    htmlFor={location._id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {location.name}
                  </label>
                </div>
              ))
            )}
          </div>
          {selectedLocations.length === 0 && (
            <p className="text-sm text-red-600 mt-1">
              Please select at least one location
            </p>
          )}
        </div>
      )}

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
  );
}
