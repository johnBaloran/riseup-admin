// src/app/(admin)/settings/admins/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create admin page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { CreateAdminForm } from "@/components/features/admins/CreateAdminForm";

export default async function NewAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session, "manage_admins")) {
    redirect("/unauthorized");
  }

  return (
    <div className="p-6">
      <CreateAdminForm />
    </div>
  );
}
