// src/app/(admin)/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Redirects to city-specific dashboard
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { getActiveCities } from "@/lib/db/queries/cities";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch active cities
  const cities = await getActiveCities();

  // No cities - show message
  if (cities.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Cities Configured
          </h1>
          <p className="text-gray-600">
            Please contact an administrator to set up cities.
          </p>
        </div>
      </div>
    );
  }

  // Redirect to first city's dashboard
  redirect(`/dashboard`);
}
