// src/app/(admin)/jerseys/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Jersey management dashboard page ONLY
 */

/**
 * Security - Server-side permission check
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import JerseyDashboard from "@/components/jerseys/JerseyDashboard";

export const metadata = {
  title: "Jersey Management | Admin",
  description: "Manage team jerseys and player details",
};

export default async function JerseyManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session, "view_jerseys")) {
    redirect("/unauthorized");
  }

  return <JerseyDashboard />;
}
