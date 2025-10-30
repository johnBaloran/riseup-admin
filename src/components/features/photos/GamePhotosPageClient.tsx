"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { PhotoUploadManager } from "./PhotoUploadManager";
import { PlayerLinkingSection } from "./PlayerLinkingSection";
import { DuplicatePersonsSection } from "./DuplicatePersonsSection";

interface Player {
  _id: string;
  playerName: string;
  jerseyNumber?: number;
  team?: {
    _id: string;
    teamName: string;
    teamCode: string;
  };
}

interface Game {
  _id: string;
  gameName: string;
  date: Date;
  week?: number;
  homeTeamScore?: number;
  awayTeamScore?: number;
  homeTeam?: {
    _id: string;
    teamName: string;
    teamCode?: string;
    teamNameShort?: string;
    players?: Player[];
  };
  awayTeam?: {
    _id: string;
    teamName: string;
    teamCode?: string;
    teamNameShort?: string;
    players?: Player[];
  };
  division: any;
}

interface Photo {
  _id?: string;
  publicId: string;
  url: string;
  thumbnail: string;
  uploadedAt: Date;
  detectedFaces?: Array<{
    personId?: string;
    [key: string]: any;
  }>;
}

interface Props {
  game: Game;
  photos: Photo[];
  photographers: any[];
  gameId: string;
}

export function GamePhotosPageClient({
  game,
  photos,
  photographers,
  gameId,
}: Props) {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const handlePersonClick = (personId: string) => {
    setSelectedPersonId(personId);
  };

  const handleClearFilter = () => {
    setSelectedPersonId(null);
  };

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
          {photographers.length > 0 && (
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="font-medium">
                {photographers.length === 1
                  ? (photographers[0] as any).name || "Unknown"
                  : `${photographers
                      .map((p: any) => p.name || "Unknown")
                      .join(", ")}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload Manager (includes circular faces) */}
      <PhotoUploadManager
        game={game}
        initialPhotos={photos}
        selectedPersonId={selectedPersonId}
        onPersonSelect={handlePersonClick}
        onClearFilter={handleClearFilter}
        gameId={gameId}
      />
      {/* Duplicate Persons Section */}
      <DuplicatePersonsSection gameId={gameId} />
      {/* Player Linking Section */}
      <PlayerLinkingSection gameId={gameId} game={game} />
    </div>
  );
}
