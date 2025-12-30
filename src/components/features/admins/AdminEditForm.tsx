// src/components/features/admins/AdminEditForm.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admin edit form ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react";

import { IAdmin } from "@/models/Admin";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

interface AdminEditFormProps {
  admin: IAdmin;
  currentAdminId: string;
}

const editAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  role: z.enum(["EXECUTIVE", "COMMISSIONER", "SCOREKEEPER", "PHOTOGRAPHER"]),
  resetPassword: z.boolean().default(false),
  newPassword: z.string().optional(),
});

type EditAdminFormValues = z.infer<typeof editAdminSchema>;

export function AdminEditForm({ admin, currentAdminId }: AdminEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);

  const isEditingSelf = admin._id.toString() === currentAdminId;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<EditAdminFormValues>({
    resolver: zodResolver(
      editAdminSchema.refine(
        (data) => {
          // If resetPassword is checked, newPassword must be provided and valid
          if (data.resetPassword && !data.newPassword) {
            return false;
          }
          if (data.resetPassword && data.newPassword) {
            // Validate password strength
            return (
              data.newPassword.length >= 8 &&
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)
            );
          }
          return true;
        },
        {
          message:
            "Password must be at least 8 characters with uppercase, lowercase, and number",
          path: ["newPassword"],
        }
      )
    ),
    defaultValues: {
      name: admin.name || "",
      email: admin.email || "",
      phoneNumber: admin.phoneNumber || "",
      role: admin.role,
      resetPassword: false,
      newPassword: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: EditAdminFormValues) => {
    setIsSubmitting(true);

    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
      };

      // Only include password if reset is checked and password is provided
      if (data.resetPassword && data.newPassword) {
        payload.password = data.newPassword;
      }

      const response = await fetch(`/api/v1/admins/${admin._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update admin");
      }

      toast.success("Staff details updated successfully");
      router.push(`/settings/admins/${admin._id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update admin:", error);
      toast.error(error.message || "Failed to update admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      EXECUTIVE: "bg-purple-100 text-purple-800",
      COMMISSIONER: "bg-blue-100 text-blue-800",
      SCOREKEEPER: "bg-green-100 text-green-800",
      PHOTOGRAPHER: "bg-orange-100 text-orange-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/settings/admins/${admin._id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Edit Staff Details</h1>
          <TutorialLink tutorialId="managing-staff" />
        </div>
        <p className="text-gray-600 mt-1">
          Update information for {admin.name}
        </p>
      </div>

      {/* Self-edit warning */}
      {isEditingSelf && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Editing Your Own Account</p>
            <p className="text-sm text-amber-700 mt-1">
              You are editing your own account. Role changes are disabled to prevent
              accidental privilege loss.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  Full Name
                </div>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  Email
                </div>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  Phone Number (Optional)
                </div>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role & Access */}
        <Card>
          <CardHeader>
            <CardTitle>Role & Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  Role
                </div>
              </Label>

              {isEditingSelf ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(admin.role)}>
                      {admin.role}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      (Cannot edit your own role)
                    </span>
                  </div>
                  <input type="hidden" {...register("role")} value={admin.role} />
                </>
              ) : (
                <>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) =>
                      setValue("role", value as any, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXECUTIVE">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          Executive
                        </div>
                      </SelectItem>
                      <SelectItem value="COMMISSIONER">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          Commissioner
                        </div>
                      </SelectItem>
                      <SelectItem value="SCOREKEEPER">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Scorekeeper
                        </div>
                      </SelectItem>
                      <SelectItem value="PHOTOGRAPHER">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          Photographer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role.message}</p>
                  )}
                </>
              )}

              <p className="text-xs text-gray-500">
                Role determines access level and permissions in the system
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security - Password Reset */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="resetPassword"
                checked={resetPassword}
                onCheckedChange={(checked) => {
                  setResetPassword(checked as boolean);
                  setValue("resetPassword", checked as boolean, {
                    shouldDirty: true,
                  });
                }}
              />
              <label
                htmlFor="resetPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Reset password for this user
              </label>
            </div>

            {resetPassword && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="newPassword">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-400" />
                    New Password
                  </div>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/settings/admins/${admin._id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
