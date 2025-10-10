// src/app/admin/league/teams/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create team page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getActiveCities } from "@/lib/db/queries/cities";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateTeamForm } from "@/components/features/league/teams/CreateTeamForm";

export default async function CreateTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_teams")) {
    redirect("/unauthorized");
  }

  const cities = await getActiveCities();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/league/teams">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>
        <p className="text-gray-600 mt-1">
          Create a new team manually. Players and captain can be assigned after
          creation.
        </p>
      </div>

      <div className="max-w-2xl">
        <CreateTeamForm cities={cities} />
      </div>
    </div>
  );
}
