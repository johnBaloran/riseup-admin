// src/components/features/test/UsersByCityTable.tsx

/**
 * Display users by city table with filter
 */

"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface User {
  _id: any;
  name: any;
  email: any;
  cities: any[];
  cityIds?: any[];
}

interface City {
  _id: string;
  cityName: string;
}

interface UsersByCityTableProps {
  users: User[];
  cities: City[];
  selectedCityId?: string;
  selectedActiveFilter: "active" | "inactive" | "all";
}

export function UsersByCityTable({
  users,
  cities,
  selectedCityId,
  selectedActiveFilter,
}: UsersByCityTableProps) {
  const router = useRouter();

  const buildUrl = (cityId?: string, activeFilter?: string) => {
    const params = new URLSearchParams();
    if (cityId && cityId !== "all") params.set("cityId", cityId);
    if (activeFilter && activeFilter !== "all")
      params.set("activeFilter", activeFilter);

    const queryString = params.toString();
    return queryString ? `/test/users-by-city?${queryString}` : "/test/users-by-city";
  };

  const handleCityChange = (value: string) => {
    router.push(buildUrl(value === "all" ? undefined : value, selectedActiveFilter));
  };

  const handleActiveFilterChange = (value: string) => {
    router.push(buildUrl(selectedCityId, value === "all" ? undefined : value));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by City:</label>
            <Select
              value={selectedCityId || "all"}
              onValueChange={handleCityChange}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city._id} value={city._id}>
                    {city.cityName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Division Status:</label>
            <Select
              value={selectedActiveFilter}
              onValueChange={handleActiveFilterChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center py-8 text-gray-500"
                >
                  No users found for the selected city.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-600">
        Total users: <span className="font-semibold">{users.length}</span>
      </div>
    </div>
  );
}
