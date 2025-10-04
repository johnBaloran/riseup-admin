// src/app/admin/[cityId]/league/divisions/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Divisions list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getDivisions } from "@/lib/db/queries/divisions";
import { getLocationsByCity } from "@/lib/db/queries/locations";
import { getAllLevels } from "@/lib/db/queries/levels";
import { DivisionsContent } from "@/components/features/league/divisions/DivisionsContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface DivisionsPageProps {
  params: { cityId: string };
  searchParams: {
    page?: string;
    tab?: string;
    location?: string;
    level?: string;
    day?: string;
    search?: string;
  };
}

export default async function DivisionsPage({
  params,
  searchParams,
}: DivisionsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "view_divisions")) {
    redirect("/unauthorized");
  }

  const page = parseInt(searchParams.page || "1");
  const tab = (searchParams.tab || "all") as any;

  const [result, locations, levels] = await Promise.all([
    getDivisions({
      cityId: params.cityId,
      page,
      activeFilter: tab,
      locationId: searchParams.location,
      levelId: searchParams.level,
      day: searchParams.day,
      search: searchParams.search,
    }),
    getLocationsByCity(params.cityId),
    getAllLevels(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Divisions</h1>
          <p className="text-gray-600 mt-1">
            Manage league divisions, schedules, and registration
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/${params.cityId}/league/divisions/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create Division
          </Link>
        </Button>
      </div>

      <DivisionsContent
        divisions={result.divisions}
        pagination={result.pagination}
        locations={locations}
        levels={levels}
        cityId={params.cityId}
        currentTab={tab}
        currentFilters={{
          location: searchParams.location,
          level: searchParams.level,
          day: searchParams.day,
          search: searchParams.search,
        }}
      />
    </div>
  );
}
