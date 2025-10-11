// src/app/(admin)/jerseys/[teamId]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Team jersey detail page ONLY
 */

/**
 * Security - Server-side permission check
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import TeamJerseyDetail from "@/components/jerseys/TeamJerseyDetail";

export const metadata = {
  title: "Team Jersey Details | Admin",
  description: "Manage team jersey design and player details",
};

interface TeamDetailPageProps {
  params: {
    teamId: string;
  };
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session, "view_jerseys")) {
    redirect("/unauthorized");
  }

  return <TeamJerseyDetail teamId={params.teamId} />;
}
