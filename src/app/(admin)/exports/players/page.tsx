// src/app/(admin)/exports/players/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player export page - EXECUTIVE only
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { PlayerExportContent } from "@/components/features/exports/PlayerExportContent";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

export default async function PlayerExportPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Only EXECUTIVE role can access this page
  if (!hasPermission(session, "export_players")) {
    redirect("/unauthorized");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Export Player Data
          </h1>
          <TutorialLink tutorialId="exporting-data" />
        </div>
        <p className="text-gray-600 mt-1">
          Download Excel report of all registered players with user accounts
        </p>
      </div>

      <PlayerExportContent />
    </div>
  );
}
