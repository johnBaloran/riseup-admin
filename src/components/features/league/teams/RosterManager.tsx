// src/components/features/league/teams/RosterManager.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Roster management orchestration ONLY
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AddPlayerDialog } from "./AddPlayerDialog";
import { RemovePlayerDialog } from "./RemovePlayerDialog";

interface RosterManagerProps {
  team: any;
  cityId: string;
}

export function RosterManager({ team, cityId }: RosterManagerProps) {
  const router = useRouter();
  const [freeAgents, setFreeAgents] = useState<any[]>([]);
  const [loadingFreeAgents, setLoadingFreeAgents] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch free agents
  useEffect(() => {
    fetchFreeAgents();
  }, [team._id]);

  const fetchFreeAgents = async () => {
    setLoadingFreeAgents(true);
    try {
      const response = await fetch(
        `/api/v1/${cityId}/teams/${team._id}/roster`
      );
      const result = await response.json();

      if (result.success) {
        setFreeAgents(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching free agents:", error);
      toast.error("Failed to load free agents");
    } finally {
      setLoadingFreeAgents(false);
    }
  };

  const handleAddPlayer = async (playerId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/v1/${cityId}/teams/${team._id}/roster`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add player");
      }

      toast.success("Player added to roster");
      setShowAddDialog(false);
      router.refresh();
      fetchFreeAgents();
    } catch (error: any) {
      toast.error(error.message || "Failed to add player");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/v1/${cityId}/teams/${team._id}/roster?playerId=${playerId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove player");
      }

      toast.success("Player removed from roster");
      setShowRemoveDialog(false);
      setSelectedPlayer(null);
      router.refresh();
      fetchFreeAgents();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove player");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Current Roster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Roster ({team.players?.length || 0})</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              disabled={loadingFreeAgents || freeAgents.length === 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!team.players || team.players.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No players on roster</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowAddDialog(true)}
                disabled={loadingFreeAgents || freeAgents.length === 0}
              >
                Add First Player
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {team.players.map((player: any) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 font-bold text-gray-600">
                      {player.jerseyNumber || "—"}
                    </div>
                    <div>
                      <p className="font-medium">{player.playerName}</p>
                      {player._id === team.teamCaptain?._id && (
                        <Badge variant="outline" className="mt-1">
                          Captain
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setShowRemoveDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Free Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Available Free Agents ({freeAgents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFreeAgents ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Loading free agents...</p>
            </div>
          ) : freeAgents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                No free agents available in this division
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Free agents are players registered for this division who aren't
                on a team
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {freeAgents.map((player: any) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 font-bold text-gray-600">
                      {player.jerseyNumber || "—"}
                    </div>
                    <div>
                      <p className="font-medium">{player.playerName}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddPlayer(player._id)}
                    disabled={isProcessing}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Player Dialog */}
      <AddPlayerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        freeAgents={freeAgents}
        onAddPlayer={handleAddPlayer}
        isProcessing={isProcessing}
      />

      {/* Remove Player Dialog */}
      <RemovePlayerDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        player={selectedPlayer}
        onRemove={handleRemovePlayer}
        isProcessing={isProcessing}
        isCaptain={selectedPlayer?._id === team.teamCaptain?._id}
      />
    </div>
  );
}
