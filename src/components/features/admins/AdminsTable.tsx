// src/components/features/admins/AdminsTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display admins table ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Edit, UserX, UserCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { IAdmin } from "@/models/Admin";

interface AdminsTableProps {
  admins: IAdmin[];
}

export function AdminsTable({ admins }: AdminsTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      EXECUTIVE: "bg-purple-100 text-purple-800",
      COMMISSIONER: "bg-blue-100 text-blue-800",
      SCOREKEEPER: "bg-green-100 text-green-800",
      PHOTOGRAPHER: "bg-orange-100 text-orange-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleToggleStatus = async (adminId: string, isActive: boolean) => {
    try {
      setLoading(adminId);
      const action = isActive ? "deactivate" : "reactivate";

      const response = await fetch(`/api/v1/admins/${adminId}`, {
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
      setLoading(null);
    }
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${adminName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(adminId);

      const response = await fetch(`/api/v1/admins/${adminId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete admin");
      }

      toast.success(data.message);
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast.error(error.message || "Failed to delete admin");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No staff members found
              </TableCell>
            </TableRow>
          ) : (
            admins.map((admin) => (
              <TableRow key={admin._id}>
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(admin.role)}>
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {admin.isActive ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {format(new Date(admin.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={loading === admin._id.toString()}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => router.push(`/settings/admins/${admin._id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/settings/admins/${admin._id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(admin._id.toString(), admin.isActive)}
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
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(admin._id.toString(), admin.name)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
