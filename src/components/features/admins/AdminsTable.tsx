// src/components/features/admins/AdminsTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display admins table ONLY
 */

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { IAdmin } from "@/models/Admin";

interface AdminsTableProps {
  admins: IAdmin[];
  cityId: string;
}

export function AdminsTable({ admins, cityId }: AdminsTableProps) {
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
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin._id}>
              <TableCell className="font-medium">{admin.name}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(admin.role)}>
                  {admin.role}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {admin.allLocations
                  ? "All Locations"
                  : `${admin.assignedLocations?.length || 0} location(s)`}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
