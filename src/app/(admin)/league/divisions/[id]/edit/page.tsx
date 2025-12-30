// src/app/league/divisions/[id]/edit/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Edit division page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getDivisionById } from "@/lib/db/queries/divisions";
import { getActiveCities } from "@/lib/db/queries/cities";
import { getAllLevels } from "@/lib/db/queries/levels";
import { EditDivisionForm } from "@/components/features/league/divisions/EditDivisionForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

interface EditDivisionPageProps {
  params: { id: string };
}

export default async function EditDivisionPage({
  params,
}: EditDivisionPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_divisions")) {
    redirect("/unauthorized");
  }

  const [division, cities, levels] = await Promise.all([
    getDivisionById(params.id),
    getActiveCities(),
    getAllLevels(null, true), // true = activeOnly for division forms
  ]);

  if (!division) {
    redirect("/league/divisions");
  }

  // Serialize data for Client Component
  const serializedDivision = JSON.parse(JSON.stringify(division));
  const serializedCities = JSON.parse(JSON.stringify(cities));
  const serializedLevels = JSON.parse(JSON.stringify(levels));

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Division</h1>
          <TutorialLink tutorialId="editing-managing-divisions" />
        </div>
        <p className="text-gray-600 mt-1">
          Update division settings and pricing
        </p>
      </div>

      <div className="max-w-4xl">
        <EditDivisionForm
          division={serializedDivision}
          cities={serializedCities}
          levels={serializedLevels}
        />
      </div>
    </div>
  );
}
