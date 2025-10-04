// src/app/admin/[cityId]/settings/admins/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admin list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { getAdmins } from "@/lib/db/queries/admins";
import { hasPermission } from "@/lib/auth/permissions";
import { AdminsTable } from "@/components/features/admins/AdminsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface AdminsPageProps {
  params: { cityId: string };
}

export default async function AdminsPage({ params }: AdminsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session, "manage_admins")) {
    redirect("/unauthorized");
  }

  const admins = await getAdmins();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage admin accounts and permissions
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/${params.cityId}/settings/admins/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Link>
        </Button>
      </div>

      <AdminsTable admins={admins} cityId={params.cityId} />
    </div>
  );
}
