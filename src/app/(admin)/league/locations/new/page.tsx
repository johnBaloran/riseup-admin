// src/app/[cityId]/league/locations/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create location page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getActiveCities } from "@/lib/db/queries/cities";
import { CreateLocationForm } from "@/components/features/league/locations/CreateLocationForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

interface CreateLocationPageProps {
  params: { cityId: string };
}

export default async function CreateLocationPage({
  params,
}: CreateLocationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_locations")) {
    redirect("/unauthorized");
  }

  const cities = await getActiveCities();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/league/locations`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Add Location</h1>
          <TutorialLink tutorialId="managing-locations" />
        </div>
        <p className="text-gray-600 mt-1">
          Create a new venue location for league games
        </p>
      </div>

      <div className="max-w-2xl">
        <CreateLocationForm cities={cities} cityId={params.cityId} />
      </div>
    </div>
  );
}
