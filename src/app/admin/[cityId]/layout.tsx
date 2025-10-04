// src/app/(admin)/[cityId]/layout.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admin section auth check and layout wrapper ONLY
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { AdminLayout } from "@/components/layout/AdminLayout";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  params: { cityId: string };
}

export default async function AdminLayoutWrapper({
  children,
  params,
}: AdminLayoutWrapperProps) {
  // Server-side auth check
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <AdminLayout cityId={params.cityId}>{children}</AdminLayout>;
}
