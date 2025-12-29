// src/components/features/profile/ProfileSettings.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Profile settings display and form ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Key,
  Loader2,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface ProfileSettingsProps {
  admin: any;
}

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileSettings({ admin }: ProfileSettingsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: admin.name || "",
      phoneNumber: admin.phoneNumber || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/admins/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OPERATOR":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "OPERATOR":
        return "Operator";
      default:
        return role;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information and security settings
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder="Enter your full name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email (Read-only) */}
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
                value={admin.email || ""}
                disabled
                className="bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                Email cannot be changed. Contact a super admin if you need to
                update your email.
              </p>
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
                placeholder="Enter your phone number"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-2">
              <Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  Role
                </div>
              </Label>
              <div>
                <Badge className={getRoleBadgeColor(admin.role)}>
                  {getRoleLabel(admin.role)}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                Your role determines your access level in the system.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
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
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-500">
                  Change your password to keep your account secure
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">
                {admin.createdAt
                  ? format(new Date(admin.createdAt), "MMMM dd, yyyy")
                  : "Unknown"}
              </p>
            </div>
          </div>

          {admin.lastLogin && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">
                  {format(
                    new Date(admin.lastLogin),
                    "MMMM dd, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="h-5 w-5 flex items-center justify-center">
              <div
                className={`h-2 w-2 rounded-full ${
                  admin.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="font-medium">
                {admin.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </div>
  );
}
