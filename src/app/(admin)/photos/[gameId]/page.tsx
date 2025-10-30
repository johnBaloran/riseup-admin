// src/app/(admin)/photos/[gameId]/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Game photo upload page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getGameById } from "@/lib/db/queries/games";
import { getGamePhotos } from "@/lib/db/queries/gamePhotos";
import { GamePhotosPageClient } from "@/components/features/photos/GamePhotosPageClient";
import { Camera } from "lucide-react";

export default async function GamePhotoUploadPage({
  params,
}: {
  params: { gameId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_photos")) {
    redirect("/unauthorized");
  }

  const [game, photos] = await Promise.all([
    getGameById(params.gameId),
    getGamePhotos(params.gameId),
  ]);

  if (!game) {
    redirect("/photos");
  }

  // Extract unique photographers from photos
  const photographers = Array.from(
    new Map(
      photos
        .map((photo: any) => photo.photographer)
        .filter(Boolean)
        .map((p: any) => [p._id?.toString() || p, p])
    ).values()
  );

  return (
    <GamePhotosPageClient
      game={game}
      photos={photos}
      photographers={photographers}
      gameId={params.gameId}
    />
  );
}
