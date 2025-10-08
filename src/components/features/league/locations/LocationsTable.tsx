// src/components/features/league/locations/LocationsTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display locations table ONLY
 */

"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Pencil, Trash2, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteLocationDialog } from "./DeleteLocationDialog";
import { EditLocationDialog } from "./EditLocationDialog";

interface Location {
  _id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

interface City {
  _id: string;
  cityName: string;
  region: string;
  country: string;
  locations: any[];
}

interface LocationsTableProps {
  locations: Location[];
  cities: City[];
}

export function LocationsTable({ locations, cities }: LocationsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [filterCity, setFilterCity] = useState<string>("all");

  // Create a map of location IDs to city info
  const locationCityMap = useMemo(() => {
    const map = new Map<string, { cityName: string; cityId: string }>();
    cities.forEach((city) => {
      city.locations.forEach((loc: any) => {
        map.set(loc._id || loc, {
          cityName: `${city.cityName}, ${city.region}`,
          cityId: city._id,
        });
      });
    });
    return map;
  }, [cities]);

  const filteredLocations = useMemo(() => {
    if (filterCity === "all") return locations;

    return locations.filter((location) => {
      const cityInfo = locationCityMap.get(location._id);
      return cityInfo?.cityId === filterCity;
    });
  }, [locations, filterCity, locationCityMap]);

  const handleDelete = (location: Location) => {
    setSelectedLocation(location);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setEditDialogOpen(true);
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by City:</label>
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city._id} value={city._id}>
                  {city.cityName}, {city.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No locations found. Create your first location to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((location) => {
                const cityInfo = locationCityMap.get(location._id);
                return (
                  <TableRow key={location._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {location.name}
                      </div>
                    </TableCell>
                    <TableCell>{location.address}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {cityInfo?.cityName || "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {location.coordinates?.latitude &&
                      location.coordinates?.longitude
                        ? `${location.coordinates.latitude}, ${location.coordinates.longitude}`
                        : "Not set"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(location)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(location)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedLocation && (
        <>
          <DeleteLocationDialog
            location={selectedLocation}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
          <EditLocationDialog
            location={selectedLocation}
            cities={cities}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </>
      )}
    </>
  );
}
