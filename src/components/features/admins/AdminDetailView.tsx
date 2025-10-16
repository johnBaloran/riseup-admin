// src/components/features/admins/AdminDetailView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display admin details ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { IAdmin } from "@/models/Admin";

interface AdminDetailViewProps {
  admin: IAdmin;
}

export function AdminDetailView({ admin }: AdminDetailViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      EXECUTIVE: "bg-purple-100 text-purple-800",
      COMMISSIONER: "bg-blue-100 text-blue-800",
      SCOREKEEPER: "bg-green-100 text-green-800",
      PHOTOGRAPHER: "bg-orange-100 text-orange-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      const action = admin.isActive ? "deactivate" : "reactivate";

      const response = await fetch(`/api/v1/admins/${admin._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} admin`);
      }

      toast.success(data.message);
      router.refresh();
    } catch (error: any) {
      console.error("Error toggling admin status:", error);
      toast.error(error.message || "Failed to update admin status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete ${admin.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/v1/admins/${admin._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete admin");
      }

      toast.success(data.message);
      router.push("/settings/admins");
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast.error(error.message || "Failed to delete admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings/admins">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff
          </Link>
        </Button>
      </div>

      {/* Staff Overview */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{admin.name}</h1>
          <Badge className={getRoleBadgeColor(admin.role)}>{admin.role}</Badge>
          {admin.isActive ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-700">
              Inactive
            </Badge>
          )}
        </div>
        <p className="text-gray-600">{admin.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{admin.email}</p>
                </div>
              </div>

              {admin.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{admin.phoneNumber}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{admin.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">
                    {format(new Date(admin.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {admin.lastLogin && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {format(new Date(admin.lastLogin), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                asChild
                disabled={loading}
              >
                <Link href={`/settings/admins/${admin._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Link>
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={handleToggleStatus}
                disabled={loading}
              >
                {admin.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Reactivate
                  </>
                )}
              </Button>

              <Button
                className="w-full"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Staff
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                {admin.isActive ? (
                  <>
                    <UserCheck className="mx-auto h-12 w-12 text-green-500 mb-3" />
                    <p className="font-medium text-green-900">Active</p>
                    <p className="text-xs text-gray-500 mt-1">
                      This staff member can access the system
                    </p>
                  </>
                ) : (
                  <>
                    <UserX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="font-medium text-gray-700">Inactive</p>
                    <p className="text-xs text-gray-500 mt-1">
                      This staff member cannot access the system
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
