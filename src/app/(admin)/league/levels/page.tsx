// src/app/league/levels/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Levels list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { LevelsContent } from "@/components/features/league/levels/LevelsContent";

interface LevelsPageProps {
  searchParams: { tab?: string };
}

export default async function LevelsPage({ searchParams }: LevelsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_levels")) {
    redirect("/unauthorized");
  }

  const activeFilter = searchParams.tab || "active";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Levels</h1>
          <p className="text-gray-600 mt-1">
            Manage skill levels for league divisions (Grade 1 = Highest)
          </p>
        </div>
      </div>

      <LevelsContent activeFilter={activeFilter} />
    </div>
  );
}
