// src/app/admin/[cityId]/league/levels/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create level page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { CreateLevelForm } from "@/components/features/league/levels/CreateLevelForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CreateLevelPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_levels")) {
    redirect("/unauthorized");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/league/levels`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Skill Level</h1>
        <p className="text-gray-600 mt-1">
          Create a new skill level for division classification
        </p>
      </div>

      <div className="max-w-2xl">
        <CreateLevelForm />
      </div>
    </div>
  );
}
