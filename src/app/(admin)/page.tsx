// src/app/(admin)/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Redirects to city-specific dashboard
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // All authenticated admins can access - redirect to dashboard
  redirect("/dashboard");
}
