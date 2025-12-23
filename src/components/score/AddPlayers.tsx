"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, PlayCircle } from "lucide-react";

interface AddPlayersProps {
  players: any[];
  checkedPlayers: any[];
  onAddNewPlayer: (
    playerName: string,
    jerseyNumber: number,
    selectedTeam: string,
    selectedDivision: string,
    instagram: string
  ) => Promise<void>;
  currentGame: any;
  setPlayers: (players: any[]) => void;
  setCheckedPlayers: (players: any[]) => void;
  setStartScore: (start: boolean) => void;
  setIsSummary: (summary: boolean) => void;
}

export default function AddPlayers({
  players,
  checkedPlayers,
  onAddNewPlayer,
  currentGame,
  setPlayers,
  setCheckedPlayers,
  setStartScore,
  setIsSummary,
}: AddPlayersProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    new Set(checkedPlayers.map((p) => p._id))
  );
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerData, setNewPlayerData] = useState({
    playerName: "",
    jerseyNumber: "",
    team: currentGame.homeTeam._id,
    instagram: "",
  });

  // Separate players by team
  const homeTeamPlayers = players.filter(
    (player) =>
      player.teamId === currentGame.homeTeam._id ||
      player.team === currentGame.homeTeam._id
  );

  const awayTeamPlayers = players.filter(
    (player) =>
      player.teamId === currentGame.awayTeam._id ||
      player.team === currentGame.awayTeam._id
  );

  const handleTogglePlayer = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handleStartScoring = async () => {
    // Get selected players and initialize their stats
    const playersToScore = players
      .filter((player) => selectedPlayers.has(player._id))
      .map((player) => {
        // Check if player already has stats for this game
        const existingStats = player.allStats?.find(
          (stat: any) => stat.game === currentGame._id
        );

        if (existingStats) {
          return player;
        }

        // Initialize stats for this game
        const newStats = {
          game: currentGame._id,
          gameId: currentGame._id,
          points: 0,
          rebounds: 0,
          assists: 0,
          blocks: 0,
          steals: 0,
          fouls: 0,
          threesMade: 0,
          twosMade: 0,
          freeThrowsMade: 0,
          pointsString: "",
        };

        return {
          ...player,
          allStats: [...(player.allStats || []), newStats],
        };
      });

    if (playersToScore.length === 0) {
      alert("Please select at least one player");
      return;
    }

    // Initialize player stats on the backend
    try {
      const promises = playersToScore.map(async (player) => {
        const stats = player.allStats.find(
          (stat: any) => stat.game === currentGame._id
        );

        // Only create stats if they don't exist
        if (stats && !stats._id) {
          const response = await fetch(
            `/api/v1/scorekeeper/${currentGame._id}/player-stats`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chosenPlayer: player._id,
                statistics: stats,
                points: false,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to initialize stats for ${player.playerName}`);
          }

          const { player: updatedPlayer } = await response.json();
          return updatedPlayer;
        }

        return player;
      });

      const updatedPlayers = await Promise.all(promises);
      setCheckedPlayers(updatedPlayers);
      setStartScore(true);
    } catch (error) {
      console.error("Error initializing player stats:", error);
      alert("Failed to initialize players. Please try again.");
    }
  };

  const handleAddNewPlayer = async () => {
    if (!newPlayerData.playerName || newPlayerData.jerseyNumber === "") {
      alert("Please fill in player name and jersey number");
      return;
    }

    try {
      await onAddNewPlayer(
        newPlayerData.playerName,
        parseInt(newPlayerData.jerseyNumber),
        newPlayerData.team,
        currentGame.division,
        newPlayerData.instagram
      );

      // Reset form
      setNewPlayerData({
        playerName: "",
        jerseyNumber: "",
        team: currentGame.homeTeam._id,
        instagram: "",
      });
      setIsAddingPlayer(false);
    } catch (error) {
      console.error("Error adding player:", error);
      alert("Failed to add player");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Home Team Players */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">
                {currentGame.homeTeam.teamName}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  homeTeamPlayers.forEach((p) => {
                    const newSelected = new Set(selectedPlayers);
                    newSelected.add(p._id);
                    setSelectedPlayers(newSelected);
                  });
                }}
              >
                Select All
              </Button>
            </div>
            <div className="space-y-2">
              {homeTeamPlayers.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedPlayers.has(player._id)}
                    onCheckedChange={() => handleTogglePlayer(player._id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      #{player.jerseyNumber} {player.playerName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Away Team Players */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">
                {currentGame.awayTeam.teamName}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  awayTeamPlayers.forEach((p) => {
                    const newSelected = new Set(selectedPlayers);
                    newSelected.add(p._id);
                    setSelectedPlayers(newSelected);
                  });
                }}
              >
                Select All
              </Button>
            </div>
            <div className="space-y-2">
              {awayTeamPlayers.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedPlayers.has(player._id)}
                    onCheckedChange={() => handleTogglePlayer(player._id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      #{player.jerseyNumber} {player.playerName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Player Dialog */}
          <Dialog open={isAddingPlayer} onOpenChange={setIsAddingPlayer}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add New Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
                <DialogDescription>
                  Add a player who isn't on the roster
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input
                    id="playerName"
                    placeholder="Enter player name"
                    value={newPlayerData.playerName}
                    onChange={(e) =>
                      setNewPlayerData({
                        ...newPlayerData,
                        playerName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jerseyNumber">Jersey Number</Label>
                  <Input
                    id="jerseyNumber"
                    type="number"
                    placeholder="Enter jersey number"
                    value={newPlayerData.jerseyNumber}
                    onChange={(e) =>
                      setNewPlayerData({
                        ...newPlayerData,
                        jerseyNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <select
                    id="team"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newPlayerData.team}
                    onChange={(e) =>
                      setNewPlayerData({
                        ...newPlayerData,
                        team: e.target.value,
                      })
                    }
                  >
                    <option value={currentGame.homeTeam._id}>
                      {currentGame.homeTeam.teamName}
                    </option>
                    <option value={currentGame.awayTeam._id}>
                      {currentGame.awayTeam.teamName}
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram (Optional)</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={newPlayerData.instagram}
                    onChange={(e) =>
                      setNewPlayerData({
                        ...newPlayerData,
                        instagram: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddingPlayer(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddNewPlayer}>
                  Add Player
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Start Scoring Button */}
          <Button
            onClick={handleStartScoring}
            className="w-full h-12 text-base font-semibold"
            disabled={selectedPlayers.size === 0}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Scoring ({selectedPlayers.size} players)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
