// src/components/features/league/cities/CitiesTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display cities table ONLY
 */

"use client";

import { useState } from "react";
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteCityDialog } from "./DeleteCityDialog";
import { EditCityDialog } from "./EditCityDialog";
import { toast } from "sonner";
import { ICity } from "@/models/City";

interface CitiesTableProps {
  cities: ICity[];
  cityId: string;
}

export function CitiesTable({ cities, cityId }: CitiesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);

  const handleDelete = (city: ICity) => {
    setSelectedCity(city);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (city: ICity) => {
    setSelectedCity(city);
    setEditDialogOpen(true);
  };

  const handleToggleActive = async (city: ICity) => {
    try {
      const response = await fetch("/api/v1/league/cities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: city._id,
          active: !city.active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update city");

      toast.success(`City ${city.active ? "deactivated" : "activated"}`);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update city status");
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No cities found. Create your first city to get started.
                </TableCell>
              </TableRow>
            ) : (
              cities.map((city) => (
                <TableRow key={city._id}>
                  <TableCell className="font-medium">{city.cityName}</TableCell>
                  <TableCell>{city.region}</TableCell>
                  <TableCell>{city.country}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {city.timezone}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {city.locations.length} location(s)
                  </TableCell>
                  <TableCell>
                    {city.active ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(city)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(city)}
                        >
                          {city.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(city)}
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

      {selectedCity && (
        <>
          <DeleteCityDialog
            city={selectedCity}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
          <EditCityDialog
            city={selectedCity}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </>
      )}
    </>
  );
}
