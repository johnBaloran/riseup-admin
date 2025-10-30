"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Calendar, Image as ImageIcon, UserCircle, Link2, Unlink, Search } from "lucide-react";
import Image from "next/image";
import { PersonDetailResponse } from "@/types/faceRecognition";
import { toast } from "sonner";

interface Props {
  personId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Player {
  _id: string;
  playerName: string;
  jerseyNumber?: number;
  team?: {
    teamName: string;
    teamCode: string;
  };
}

export function PersonDetailModal({ personId, isOpen, onClose }: Props) {
  const [personDetails, setPersonDetails] = useState<PersonDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Player linking state
  const [playerSearch, setPlayerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);
  const [linkingPlayer, setLinkingPlayer] = useState(false);
  const [linkedPlayer, setLinkedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (isOpen && personId) {
      fetchPersonDetails();
    }
  }, [personId, isOpen]);

  const fetchPersonDetails = async () => {
    if (!personId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/person/${personId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch person details");
      }

      const result = await response.json();
      setPersonDetails(result.data);

      // TODO: Fetch linked player if exists
      // For now, linkedPlayer will be null
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchPlayers = async (search: string) => {
    if (!search || search.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchingPlayers(true);
      const response = await fetch(`/api/v1/players?search=${encodeURIComponent(search)}`);

      if (!response.ok) {
        throw new Error("Failed to search players");
      }

      const result = await response.json();
      setSearchResults(result.data.players || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSearchingPlayers(false);
    }
  };

  const linkPlayer = async (playerId: string) => {
    if (!personId) return;

    try {
      setLinkingPlayer(true);
      const response = await fetch(`/api/v1/persons/${personId}/link-player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to link player");
      }

      const result = await response.json();
      toast.success("Player linked successfully!");

      // Find the linked player from search results
      const player = searchResults.find((p) => p._id === playerId);
      if (player) {
        setLinkedPlayer(player);
      }

      // Clear search
      setPlayerSearch("");
      setSearchResults([]);

      // Refresh person details
      await fetchPersonDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLinkingPlayer(false);
    }
  };

  const unlinkPlayer = async () => {
    if (!personId) return;

    try {
      setLinkingPlayer(true);
      const response = await fetch(`/api/v1/persons/${personId}/link-player`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unlink player");
      }

      toast.success("Player unlinked successfully!");
      setLinkedPlayer(null);

      // Refresh person details
      await fetchPersonDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLinkingPlayer(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Person Details
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 py-4">{error}</div>
        )}

        {personDetails && !loading && (
          <div className="space-y-6">
            {/* Person Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Person ID</p>
                <p className="font-mono text-sm">{personDetails.person._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Game ID</p>
                <p className="font-mono text-sm truncate">
                  {personDetails.person.gameId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quality Score</p>
                <p className="text-sm">
                  {Math.round(personDetails.person.metadata.qualityScore)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Photos</p>
                <p className="text-sm">{personDetails.totalPhotos}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">First Detected</p>
                <p className="text-sm">
                  {new Date(personDetails.person.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Face Crop URL</p>
                <p className="text-xs text-gray-500 truncate">
                  {personDetails.person.faceCropUrl ? "Available" : "N/A"}
                </p>
              </div>
            </div>

            {/* Player Linking Section */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link to Player
              </h4>

              {linkedPlayer ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{linkedPlayer.playerName}</p>
                      {linkedPlayer.jerseyNumber && (
                        <p className="text-sm text-gray-600">#{linkedPlayer.jerseyNumber}</p>
                      )}
                      {linkedPlayer.team && (
                        <p className="text-sm text-gray-600">{linkedPlayer.team.teamName}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={unlinkPlayer}
                      disabled={linkingPlayer}
                    >
                      {linkingPlayer ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Unlink className="w-4 h-4 mr-1" />
                          Unlink
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search players by name..."
                      value={playerSearch}
                      onChange={(e) => {
                        setPlayerSearch(e.target.value);
                        searchPlayers(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>

                  {searchingPlayers && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                      {searchResults.map((player) => (
                        <div
                          key={player._id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          onClick={() => linkPlayer(player._id)}
                        >
                          <div>
                            <p className="font-medium text-sm">{player.playerName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {player.jerseyNumber && <span>#{player.jerseyNumber}</span>}
                              {player.team && <span>{player.team.teamName}</span>}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={linkingPlayer}
                          >
                            Link
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {playerSearch.length >= 2 && !searchingPlayers && searchResults.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No players found
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Photos Grid */}
            <div>
              <h4 className="font-semibold mb-3">
                Photos ({personDetails.photos.length})
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {personDetails.photos.map((photo) => (
                  <div
                    key={photo._id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-500 transition-colors"
                  >
                    <Image
                      src={photo.cloudinaryUrl}
                      alt="Person photo"
                      fill
                      className="object-cover"
                    />
                    {photo.isPrimary && (
                      <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {Math.round(photo.detectedFaces[0]?.confidence || 0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
