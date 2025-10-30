"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Link2, Unlink, Users, Check, Split } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { GamePersonsResponse } from "@/types/faceRecognition";
import { SplitPersonModal } from "./SplitPersonModal";

interface Player {
  _id: string;
  playerName: string;
  jerseyNumber?: number;
  teamName?: string;
  teamCode?: string;
  team?: {
    _id: string;
    teamName: string;
    teamCode: string;
  };
}

interface Game {
  _id: string;
  gameName: string;
  homeTeam?: {
    _id: string;
    teamName: string;
    players?: Player[];
  };
  awayTeam?: {
    _id: string;
    teamName: string;
    players?: Player[];
  };
}

interface Props {
  gameId: string;
  game: Game;
}

export function PlayerLinkingSection({ gameId, game }: Props) {
  const [gamePersons, setGamePersons] = useState<GamePersonsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Player linking modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [linkingPlayer, setLinkingPlayer] = useState(false);

  // Split person modal state
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitPersonId, setSplitPersonId] = useState<string | null>(null);
  const [splitPersonFaceCropUrl, setSplitPersonFaceCropUrl] = useState<string>("");

  // Player lookup for displaying linked player names
  const [playerLookup, setPlayerLookup] = useState<Record<string, Player>>({});

  useEffect(() => {
    fetchGamePersons();
  }, [gameId]);

  // Build player lookup from game object
  useEffect(() => {
    const homePlayers = game.homeTeam?.players || [];
    const awayPlayers = game.awayTeam?.players || [];
    const allPlayers = [...homePlayers, ...awayPlayers];

    const lookup = allPlayers.reduce((acc, player) => {
      acc[player._id] = {
        ...player,
        teamName: homePlayers.includes(player)
          ? game.homeTeam?.teamName
          : game.awayTeam?.teamName,
        teamCode: homePlayers.includes(player)
          ? game.homeTeam?.teamCode
          : game.awayTeam?.teamCode,
      };
      return acc;
    }, {} as Record<string, Player>);

    setPlayerLookup(lookup);
  }, [game]);

  const fetchGamePersons = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/persons/game/${gameId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch persons");
      }

      const result = await response.json();
      setGamePersons(result.data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersFromTeams = async () => {
    try {
      setLoadingPlayers(true);

      // Get players from game object (already populated)
      const homePlayers = (game.homeTeam?.players || []).map((p) => ({
        ...p,
        teamName: game.homeTeam?.teamName,
        teamCode: game.homeTeam?.teamCode,
      }));

      const awayPlayers = (game.awayTeam?.players || []).map((p) => ({
        ...p,
        teamName: game.awayTeam?.teamName,
        teamCode: game.awayTeam?.teamCode,
      }));

      if (homePlayers.length === 0 && awayPlayers.length === 0) {
        toast.error("No players found for this game");
        setPlayers([]);
        return;
      }

      // Combine players from both teams
      const allPlayers = [...homePlayers, ...awayPlayers];

      // Filter out already-linked players
      // Create a Set of player IDs that are already linked to persons
      const linkedPlayerIds = new Set(
        gamePersons?.persons
          .filter((p) => p.playerId)
          .map((p) => p.playerId.toString()) || []
      );

      // Only show players that haven't been linked yet
      const availablePlayers = allPlayers.filter(
        (player) => !linkedPlayerIds.has(player._id)
      );

      setPlayers(availablePlayers);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const openLinkPlayerModal = (personId: string) => {
    setSelectedPersonId(personId);
    setIsModalOpen(true);
    fetchPlayersFromTeams();
  };

  const linkPlayer = async (playerId: string) => {
    if (!selectedPersonId) return;

    try {
      setLinkingPlayer(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/link-player`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personId: selectedPersonId,
            playerId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to link player");
      }

      toast.success("Player linked successfully!");

      // Close modal and clear state
      setIsModalOpen(false);
      setSelectedPersonId(null);
      setPlayers([]);

      // Refresh
      await fetchGamePersons();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLinkingPlayer(false);
    }
  };

  const unlinkPlayer = async (personId: string) => {
    try {
      setLinkingPlayer(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/link-player/${personId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unlink player");
      }

      toast.success("Player unlinked successfully!");

      // Refresh
      await fetchGamePersons();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLinkingPlayer(false);
    }
  };

  const openSplitModal = (personId: string, faceCropUrl: string) => {
    setSplitPersonId(personId);
    setSplitPersonFaceCropUrl(faceCropUrl);
    setIsSplitModalOpen(true);
  };

  const handleSplitSuccess = async () => {
    // Refresh persons after successful split
    await fetchGamePersons();
    setIsSplitModalOpen(false);
    setSplitPersonId(null);
    setSplitPersonFaceCropUrl("");
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (!gamePersons || gamePersons.totalPersons === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-semibold">Link People to Players</h2>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Manually link detected faces to player profiles. Links are game-scoped
        only.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {gamePersons.persons.map((person) => {
          const faceCropUrl = person.faceCropUrl;
          const isLinked = !!person.playerId;
          const linkedPlayer = person.playerId
            ? playerLookup[person.playerId]
            : null;

          return (
            <Card
              key={person._id}
              className={`p-4 transition-all hover:shadow-md ${
                isLinked
                  ? "ring-2 ring-green-500 bg-green-50/30"
                  : "hover:border-blue-300"
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Face thumbnail */}
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 relative ring-2 ring-gray-200">
                  {faceCropUrl && (
                    <Image
                      src={faceCropUrl}
                      alt="Person"
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  )}
                  {isLinked && (
                    <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">
                    ID: {person._id.slice(-6)}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <span>
                      {person.photoCount} photo
                      {person.photoCount !== 1 ? "s" : ""}
                    </span>
                    <span>•</span>
                    <span>Q: {Math.round(person.metadata.qualityScore)}</span>
                  </div>

                  {/* Show linked player status */}
                  {isLinked ? (
                    <div className="mt-3 space-y-2">
                      {linkedPlayer ? (
                        <div className="bg-green-100 rounded px-2 py-1.5 border border-green-300">
                          <p className="text-xs font-medium text-green-800">
                            {linkedPlayer.playerName}
                          </p>
                          <p className="text-xs text-green-600">
                            {linkedPlayer.jerseyNumber &&
                              `#${linkedPlayer.jerseyNumber} • `}
                            {linkedPlayer.teamCode}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-green-600 font-medium">
                          Linked to Player
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unlinkPlayer(person._id)}
                        disabled={linkingPlayer}
                        className="h-7 text-xs w-full"
                      >
                        <Unlink className="w-3 h-3 mr-1" />
                        Unlink
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openLinkPlayerModal(person._id)}
                      className="mt-3 h-8 text-xs w-full"
                    >
                      <Link2 className="w-3 h-3 mr-1" />
                      Link to Player
                    </Button>
                  )}

                  {/* Split button - show if person has multiple photos */}
                  {person.photoCount > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openSplitModal(person._id, person.faceCropUrl)}
                      className="mt-2 h-7 text-xs w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <Split className="w-3 h-3 mr-1" />
                      Split Person
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Player Linking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Link to Player
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Select a player from {game.homeTeam?.teamName || "home team"} or{" "}
              {game.awayTeam?.teamName || "away team"}
            </p>
          </DialogHeader>

          {loadingPlayers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No players available</p>
              <p className="text-sm mt-1">
                No players found in {game.homeTeam?.teamName || "home team"} or{" "}
                {game.awayTeam?.teamName || "away team"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group players by team - show home team first, then away team */}
              {[
                { name: game.homeTeam?.teamName },
                { name: game.awayTeam?.teamName },
              ].map((team) => {
                const teamPlayers = players.filter(
                  (player) => player.teamName === team.name
                );

                if (teamPlayers.length === 0) return null;

                return (
                  <div key={team.name}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {team.name}

                      <span className="text-xs text-gray-500 font-normal ml-1">
                        • {teamPlayers.length} available player
                        {teamPlayers.length !== 1 ? "s" : ""}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {teamPlayers.map((player) => (
                        <Button
                          key={player._id}
                          variant="outline"
                          className="h-auto p-3 justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          onClick={() => linkPlayer(player._id)}
                          disabled={linkingPlayer}
                        >
                          <div className="text-left w-full">
                            <p className="font-medium text-sm">
                              {player.playerName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              {player.jerseyNumber && (
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                  #{player.jerseyNumber}
                                </span>
                              )}
                              <span className="text-gray-400">
                                {player.teamCode}
                              </span>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Split Person Modal */}
      {splitPersonId && (
        <SplitPersonModal
          isOpen={isSplitModalOpen}
          onClose={() => setIsSplitModalOpen(false)}
          personId={splitPersonId}
          personFaceCropUrl={splitPersonFaceCropUrl}
          onSplitSuccess={handleSplitSuccess}
        />
      )}
    </Card>
  );
}
