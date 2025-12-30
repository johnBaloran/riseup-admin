// src/app/(admin)/settings/admins/[id]/edit/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admin edit page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { getAdminById } from "@/lib/db/queries/admins";
import { hasPermission } from "@/lib/auth/permissions";
import { AdminEditForm } from "@/components/features/admins/AdminEditForm";

interface AdminEditPageProps {
  params: { id: string };
}

export const metadata = {
  title: "Edit Staff | Admin",
  description: "Edit staff member details",
};

export default async function AdminEditPage({ params }: AdminEditPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session, "manage_admins")) {
    redirect("/unauthorized");
  }

  const admin = await getAdminById(params.id);

  if (!admin) {
    redirect("/settings/admins");
  }

  // Get current user ID to prevent self-role editing
  const currentAdminId = (session.user as any).id;

  return (
    <AdminEditForm
      admin={admin}
      currentAdminId={currentAdminId}
    />
  );
}
