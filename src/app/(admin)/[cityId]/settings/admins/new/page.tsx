// src/app/[cityId]/settings/admins/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create admin page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getLocationsByCity } from "@/lib/db/queries/locations";
import { CreateAdminForm } from "@/components/features/admins/CreateAdminForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CreateAdminPageProps {
  params: { cityId: string };
}

export default async function CreateAdminPage({
  params,
}: CreateAdminPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_admins")) {
    redirect("/unauthorized");
  }

  const locations = await getLocationsByCity(params.cityId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/settings/admins`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Staff Member</h1>
        <p className="text-gray-600 mt-1">
          Create a new admin account with role and location access
        </p>
      </div>

      <div className="max-w-2xl">
        <CreateAdminForm locations={locations} cityId={params.cityId} />
      </div>
    </div>
  );
}
