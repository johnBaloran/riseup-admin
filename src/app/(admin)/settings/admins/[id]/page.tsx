// src/app/(admin)/settings/admins/[id]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admin detail page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { getAdminById } from "@/lib/db/queries/admins";
import { hasPermission } from "@/lib/auth/permissions";
import { AdminDetailView } from "@/components/features/admins/AdminDetailView";

interface AdminDetailPageProps {
  params: { id: string };
}

export default async function AdminDetailPage({
  params,
}: AdminDetailPageProps) {
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

  return <AdminDetailView admin={admin} />;
}
