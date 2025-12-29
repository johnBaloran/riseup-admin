// src/app/(admin)/settings/profile/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Profile settings page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { getAdminById } from "@/lib/db/queries/admins";
import { ProfileSettings } from "@/components/features/profile/ProfileSettings";

export const metadata = {
  title: "Profile Settings | Admin",
  description: "Manage your profile and security settings",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Get current admin's full profile
  const adminId = (session.user as any).id;
  const admin = await getAdminById(adminId);

  if (!admin) {
    redirect("/login");
  }

  return <ProfileSettings admin={admin} />;
}
