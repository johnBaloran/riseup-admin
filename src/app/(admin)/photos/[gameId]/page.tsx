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
import { PhotoUploadManager } from "@/components/features/photos/PhotoUploadManager";

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

  return (
    <div className="p-6 space-y-6">
      {/* Game Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{game.gameName}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Division:</span>{" "}
            {(game.division as any)?.divisionName}
          </div>
          <div>
            <span className="font-medium">Date:</span>{" "}
            {new Date(game.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div>
            <span className="font-medium">Week:</span> {game.week}
          </div>
          <div>
            <span className="font-medium">Score:</span> {game.homeTeamScore} -{" "}
            {game.awayTeamScore}
          </div>
        </div>
      </div>

      {/* Photo Upload Manager */}
      <PhotoUploadManager game={game} initialPhotos={photos} />
    </div>
  );
}
