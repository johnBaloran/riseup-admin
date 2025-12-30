// src/app/league/cities/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Cities list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getAllCities } from "@/lib/db/queries/cities";
import { CitiesTable } from "@/components/features/league/cities/CitiesTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

export default async function CitiesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_cities")) {
    redirect("/unauthorized");
  }

  const cities = await getAllCities();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Cities</h1>
            <TutorialLink tutorialId="setting-up-cities" />
          </div>
          <p className="text-gray-600 mt-1">
            Manage cities and geographic locations
          </p>
        </div>
        <Button asChild>
          <Link href="/league/cities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add City
          </Link>
        </Button>
      </div>

      <CitiesTable cities={cities} />
    </div>
  );
}
