// src/app/(admin)/tutorials/layout.tsx

/**
 * Tutorial Layout - Full-width layout without main app sidebar
 * Provides dedicated space for tutorial content with its own navigation
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import TutorialLayout from "@/components/layout/TutorialLayout";

interface TutorialLayoutWrapperProps {
  children: React.ReactNode;
}

export default async function TutorialLayoutWrapper({
  children,
}: TutorialLayoutWrapperProps) {
  // Server-side auth check
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <TutorialLayout>{children}</TutorialLayout>;
}
