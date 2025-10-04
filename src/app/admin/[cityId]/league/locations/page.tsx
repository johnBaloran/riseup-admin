// src/app/admin/[cityId]/league/locations/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Locations list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getAllLocations } from "@/lib/db/queries/locations";
import { getActiveCities } from "@/lib/db/queries/cities";
import { LocationsTable } from "@/components/features/league/locations/LocationsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface LocationsPageProps {
  params: { cityId: string };
}

export default async function LocationsPage({ params }: LocationsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_locations")) {
    redirect("/unauthorized");
  }

  const [locations, cities] = await Promise.all([
    getAllLocations(),
    getActiveCities(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-gray-600 mt-1">
            Manage venue locations for league operations
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/${params.cityId}/league/locations/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Link>
        </Button>
      </div>

      <LocationsTable
        locations={locations}
        cities={cities}
        cityId={params.cityId}
      />
    </div>
  );
}
