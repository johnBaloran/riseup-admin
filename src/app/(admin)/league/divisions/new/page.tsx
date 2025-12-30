// src/app/league/divisions/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create division page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getActiveCities } from "@/lib/db/queries/cities";
import { getAllLevels } from "@/lib/db/queries/levels";
import { getAllPrices } from "@/lib/db/queries/prices";
import { CreateDivisionForm } from "@/components/features/league/divisions/CreateDivisionForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

export default async function CreateDivisionPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_divisions")) {
    redirect("/unauthorized");
  }

  const [cities, levels, prices] = await Promise.all([
    getActiveCities(),
    getAllLevels(null, true), // true = activeOnly for division forms
    getAllPrices(),
  ]);

  // Serialize data for Client Component
  const serializedCities = JSON.parse(JSON.stringify(cities));
  const serializedLevels = JSON.parse(JSON.stringify(levels));
  const serializedPrices = JSON.parse(JSON.stringify(prices));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/league/divisions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Create Division</h1>
          <TutorialLink tutorialId="creating-divisions" />
        </div>
        <p className="text-gray-600 mt-1">
          Set up a new division with schedule, pricing, and registration
          settings
        </p>
      </div>

      <div className="max-w-4xl">
        <CreateDivisionForm
          cities={serializedCities}
          levels={serializedLevels}
          prices={serializedPrices}
        />
      </div>
    </div>
  );
}
