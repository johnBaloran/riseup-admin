// src/app/(admin)/tutorials/[tutorialId]/page.tsx

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect, notFound } from "next/navigation";
import { getTutorialById, getRelatedTutorials } from "@/data/tutorials";
import TutorialDetailClient from "@/components/features/tutorials/TutorialDetailClient";
import { Role } from "@/types/tutorial";

interface TutorialDetailPageProps {
  params: {
    tutorialId: string;
  };
  searchParams: {
    section?: string;
  };
}

export async function generateMetadata({
  params,
}: TutorialDetailPageProps): Promise<Metadata> {
  const tutorial = getTutorialById(params.tutorialId);

  if (!tutorial) {
    return {
      title: "Tutorial Not Found",
    };
  }

  return {
    title: `${tutorial.title} | Tutorials | Riseup Admin`,
    description: tutorial.description,
  };
}

export default async function TutorialDetailPage({
  params,
  searchParams,
}: TutorialDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const tutorial = getTutorialById(params.tutorialId);

  if (!tutorial) {
    notFound();
  }

  // Check if user has permission to view this tutorial
  const userRole: Role = session.user.role.toUpperCase() as Role;
  const hasAccess =
    tutorial.roles.includes(userRole) || tutorial.roles.includes("ALL");

  if (!hasAccess) {
    // User doesn't have permission to view this tutorial
    redirect("/tutorials");
  }

  // Get related tutorials
  const relatedTutorials = getRelatedTutorials(params.tutorialId);

  return (
    <TutorialDetailClient
      tutorial={tutorial}
      relatedTutorials={relatedTutorials}
      initialSection={searchParams.section}
      userRole={userRole}
    />
  );
}
