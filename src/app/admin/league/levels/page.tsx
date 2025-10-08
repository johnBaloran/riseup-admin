// src/app/admin/[cityId]/league/levels/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Levels list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getAllLevels } from "@/lib/db/queries/levels";
import { LevelsTable } from "@/components/features/league/levels/LevelsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface LevelsPageProps {
  params: { cityId: string };
}

export default async function LevelsPage({ params }: LevelsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_levels")) {
    redirect("/unauthorized");
  }

  const levels = await getAllLevels();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Levels</h1>
          <p className="text-gray-600 mt-1">
            Manage skill levels for league divisions (Grade 1 = Highest)
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/${params.cityId}/league/levels/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Level
          </Link>
        </Button>
      </div>

      <LevelsTable levels={levels} cityId={params.cityId} />
    </div>
  );
}
