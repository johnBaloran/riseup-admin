// src/app/(admin)/photos/media-day/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Media day photos gallery page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getMediaDaySessions } from "@/lib/db/queries/mediaDayPhotos";
import { getAllLocations } from "@/lib/db/queries/locations";
import { MediaDayGallery } from "@/components/features/photos/MediaDayGallery";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload } from "lucide-react";

export default async function MediaDayPhotosPage({
  searchParams,
}: {
  searchParams: {
    locationId?: string;
    startDate?: string;
    endDate?: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_photos")) {
    redirect("/unauthorized");
  }

  const [sessions, locations] = await Promise.all([
    getMediaDaySessions({
      locationId: searchParams.locationId,
      startDate: searchParams.startDate
        ? new Date(searchParams.startDate + "T00:00:00Z")
        : undefined,
      endDate: searchParams.endDate
        ? new Date(searchParams.endDate + "T23:59:59Z")
        : undefined,
    }),
    getAllLocations(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Media Day Photos
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage promotional photos from media day events
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/photos/media-day/upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photos
          </Link>
        </Button>
      </div>

      <MediaDayGallery
        sessions={sessions}
        locations={locations}
        filters={{
          locationId: searchParams.locationId,
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
        }}
      />
    </div>
  );
}
