// src/app/(admin)/photos/media-day/upload/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Media day photo upload page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getAllLocations } from "@/lib/db/queries/locations";
import { MediaDayUploadManager } from "@/components/features/photos/MediaDayUploadManager";

export default async function MediaDayUploadPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_photos")) {
    redirect("/unauthorized");
  }

  const locations = await getAllLocations();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Media Day Photo Upload
        </h1>
        <p className="text-gray-600 mt-1">
          Upload promotional photos from media day events
        </p>
      </div>

      <MediaDayUploadManager locations={locations} />
    </div>
  );
}
