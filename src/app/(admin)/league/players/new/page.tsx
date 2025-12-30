// src/app/league/players/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create player page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getActiveCities } from "@/lib/db/queries/cities";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreatePlayerForm } from "@/components/features/league/players/CreatePlayerForm";
import { PageHeader } from "@/components/layout/PageHeader";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

interface CreatePlayerPageProps {
  params: { cityId: string };
}

export default async function CreatePlayerPage({
  params,
}: CreatePlayerPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_players")) {
    redirect("/unauthorized");
  }

  const cities = await getActiveCities();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/league/players`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Create Player</h1>
          <TutorialLink tutorialId="adding-players-manually" />
        </div>
        <p className="text-gray-600 mt-1">
          Manually create a player profile. Payment and user account can be set
          up later.
        </p>
      </div>

      <div className="max-w-2xl">
        <CreatePlayerForm cityId={params.cityId} cities={cities} />
      </div>
    </div>
  );
}
