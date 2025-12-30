// src/app/league/teams/[id]/edit/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Edit team page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getTeamById } from "@/lib/db/queries/teams";
import { getActiveCities } from "@/lib/db/queries/cities";
import { EditTeamForm } from "@/components/features/league/teams/EditTeamForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

interface EditTeamPageProps {
  params: { cityId: string; id: string };
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_teams")) {
    redirect("/unauthorized");
  }

  const [team, cities] = await Promise.all([
    getTeamById(params.id),
    getActiveCities(),
  ]);

  if (!team) {
    redirect(`/league/teams`);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/league/teams/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
          <TutorialLink tutorialId="editing-managing-teams" />
        </div>
        <p className="text-gray-600 mt-1">
          Update team information and settings
        </p>
      </div>

      <div className="max-w-2xl">
        <EditTeamForm team={team} cityId={params.cityId} cities={cities} />
      </div>
    </div>
  );
}
