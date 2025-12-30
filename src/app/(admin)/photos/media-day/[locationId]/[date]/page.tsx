// src/app/(admin)/photos/media-day/[locationId]/[date]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Media day photo gallery view page ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getMediaDayPhotos } from "@/lib/db/queries/mediaDayPhotos";
import { getLocationById } from "@/lib/db/queries/locations";
import { MediaDayPhotoGalleryWithHeader } from "@/components/features/photos/MediaDayPhotoGalleryWithHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TutorialLink from "@/components/features/tutorials/TutorialLink";

export default async function MediaDayPhotoGalleryPage({
  params,
}: {
  params: { locationId: string; date: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_photos")) {
    redirect("/unauthorized");
  }

  // Parse date in UTC for consistency across environments
  const date = new Date(params.date + "T00:00:00Z");

  const [photos, location] = await Promise.all([
    getMediaDayPhotos(params.locationId, date),
    getLocationById(params.locationId),
  ]);

  if (!location) {
    redirect("/photos/media-day");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/photos/media-day">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Media Day
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Media Day Photos</h1>
          <TutorialLink tutorialId="media-day-setup" sectionId="media-day-upload-workflow" />
        </div>
      </div>

      <MediaDayPhotoGalleryWithHeader
        photos={photos}
        location={location}
        locationId={params.locationId}
        dateStr={params.date}
      />
    </div>
  );
}
