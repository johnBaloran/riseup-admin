// src/app/(admin)/tutorials/page.tsx

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import TutorialsPageClient from "@/components/features/tutorials/TutorialsPageClient";
import {
  allTutorials,
  getTutorialsByRole,
  getCategoriesForRole,
  getAllTags,
  getTutorialStats,
} from "@/data/tutorials";
import { Role } from "@/types/tutorial";

export const metadata: Metadata = {
  title: "Tutorials | Riseup Admin",
  description: "Learn how to use the Riseup Admin portal",
};

export default async function TutorialsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get user role - map from session role to tutorial role
  const userRole: Role = session.user.role.toUpperCase() as Role;

  // Get tutorials filtered by user role
  const tutorials = getTutorialsByRole(userRole);

  // Get available categories for this role
  const categories = getCategoriesForRole(userRole);

  // Get all tags for filtering
  const tags = getAllTags(userRole);

  // Get statistics
  const stats = getTutorialStats(userRole);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tutorials</h1>
        <p className="text-gray-600">
          Learn how to use the Riseup Admin portal. Browse by category or
          search for specific topics.
        </p>
      </div>

      <TutorialsPageClient
        tutorials={tutorials}
        categories={categories}
        tags={tags}
        stats={stats}
        userRole={userRole}
      />
    </div>
  );
}
