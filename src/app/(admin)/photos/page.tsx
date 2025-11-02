// src/app/(admin)/photos/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Photos management page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getGamesWithPhotoStatus } from "@/lib/db/queries/gamePhotos";
import { getAllCities } from "@/lib/db/queries/cities";
import { getAllLocations } from "@/lib/db/queries/locations";
import { getAllLevels } from "@/lib/db/queries/levels";
import { PhotosTable } from "@/components/features/photos/PhotosTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Camera, ArrowRight } from "lucide-react";

export default async function PhotosManagementPage({
  searchParams,
}: {
  searchParams: {
    cityId?: string;
    locationId?: string;
    photoStatus?: "hasPhotos" | "needsPhotos" | "all";
    day?: string;
    levelId?: string;
    activeOnly?: string;
    page?: string;
    search?: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_photos")) {
    redirect("/unauthorized");
  }

  // Parse pagination params
  const page = parseInt(searchParams.page || "1");
  const activeOnly = searchParams.activeOnly || "active"; // Default to "active"

  const [gamesData, cities, locations, levels] = await Promise.all([
    getGamesWithPhotoStatus({
      cityId: searchParams.cityId,
      locationId: searchParams.locationId,
      photoStatus: searchParams.photoStatus || "all",
      day: searchParams.day,
      levelId: searchParams.levelId,
      divisionStatus: activeOnly as "all" | "active" | "inactive", // Pass as "all", "active", or "inactive"
      search: searchParams.search,
      page,
      limit: 20, // Show 20 games per page
    }),
    getAllCities(),
    getAllLocations(),
    getAllLevels(), // Show all levels in filter dropdown
  ]);

  // Serialize data to ensure it's JSON-safe for client components
  const serializedGames = JSON.parse(JSON.stringify(gamesData.games));
  const serializedPagination = JSON.parse(JSON.stringify(gamesData.pagination));
  const serializedCities = JSON.parse(JSON.stringify(cities));
  const serializedLocations = JSON.parse(JSON.stringify(locations));
  const serializedLevels = JSON.parse(JSON.stringify(levels));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Photos Management</h1>
        <p className="text-gray-600 mt-1">
          Upload and manage game photos and media day photos
        </p>
      </div>

      {/* Photo Type Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Game Photos</h3>
              <p className="text-gray-600 text-sm mb-4">
                Upload and manage photos from completed games. Organized by game, division, and location.
              </p>
              <Button asChild variant="default">
                <Link href="#game-photos">
                  View Game Photos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </Card> */}

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Media Day Photos</h3>
              <p className="text-gray-600 text-sm mb-4">
                Upload promotional photos from media day events. Organized by
                location and date.
              </p>
              <Button asChild variant="outline">
                <Link href="/photos/media-day">
                  View Media Day
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Game Photos Section */}
      <div id="game-photos" className="scroll-mt-6">
        <h2 className="text-2xl font-bold mb-4">Game Photos</h2>
        <PhotosTable
          games={serializedGames}
          cities={serializedCities}
          locations={serializedLocations}
          levels={serializedLevels}
          pagination={serializedPagination}
          filters={{
            cityId: searchParams.cityId,
            locationId: searchParams.locationId,
            photoStatus: searchParams.photoStatus || "all",
            day: searchParams.day,
            levelId: searchParams.levelId,
            activeOnly: activeOnly, // "all", "active", or "inactive"
            search: searchParams.search,
          }}
        />
      </div>
    </div>
  );
}
