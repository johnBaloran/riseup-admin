// src/app/league/cities/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create city page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { CreateCityForm } from "@/components/features/league/cities/CreateCityForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

export default async function CreateCityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_cities")) {
    redirect("/unauthorized");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/league/cities">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Add City</h1>
          <TutorialLink tutorialId="setting-up-cities" />
        </div>
        <p className="text-gray-600 mt-1">
          Create a new city for league operations
        </p>
      </div>

      <div className="max-w-2xl">
        <CreateCityForm />
      </div>
    </div>
  );
}
