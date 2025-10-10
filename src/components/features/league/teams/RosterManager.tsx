// src/components/features/league/teams/RosterManager.tsx - Add quick create

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
import {
  Users,
  UserPlus,
  Trash2,
  AlertCircle,
  Plus,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { AddPlayerDialog } from "./AddPlayerDialog";
import { RemovePlayerDialog } from "./RemovePlayerDialog";
import { QuickCreatePlayerDialog } from "./QuickCreatePlayerDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQuickCreateDialog, setShowQuickCreateDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchFreeAgents();
  }, [team._id]);

  const fetchFreeAgents = async () => {
    setLoadingFreeAgents(true);
    try {
      const response = await fetch(`/api/v1/teams/${team._id}/roster`);
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
        `/api/v1/teams/${team._id}/roster?playerId=${playerId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove player");
      }

      toast.success("Player removed from roster (now free agent)");
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

  const handleDeletePlayer = async (playerId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/v1/players?id=${playerId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete player");
      }

      toast.success("Player deleted successfully");
      setShowDeleteDialog(false);
      setSelectedPlayer(null);
      router.refresh();
      fetchFreeAgents();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete player");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickCreateSuccess = () => {
    setShowQuickCreateDialog(false);
    router.refresh();
    fetchFreeAgents();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Current Roster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Roster ({team.players?.length || 0})</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowQuickCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddDialog(true)}
                disabled={loadingFreeAgents || freeAgents.length === 0}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Existing
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!team.players || team.players.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No players on roster</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickCreateDialog(true)}
                >
                  Create New Player
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  disabled={loadingFreeAgents || freeAgents.length === 0}
                >
                  Add Existing Player
                </Button>
              </div>
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
                      <div className="flex items-center gap-2 mt-1">
                        {player._id === team.teamCaptain?._id && (
                          <Badge variant="outline">Captain</Badge>
                        )}
                        {player.user ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Has Account
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-600 border-gray-200"
                          >
                            No Account
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPlayer(player);
                        setShowRemoveDialog(true);
                      }}
                      title="Make free agent"
                    >
                      <UserMinus className="h-4 w-4 text-orange-600" />
                    </Button>
                    {!player.user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPlayer(player);
                          setShowDeleteDialog(true);
                        }}
                        title="Delete player (only for players without accounts)"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
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
                Create a new player to add them to the roster
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
                      {player.user ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 mt-1"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Has Account
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-600 border-gray-200 mt-1"
                        >
                          No Account
                        </Badge>
                      )}
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

      {/* Dialogs */}
      <AddPlayerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        freeAgents={freeAgents}
        onAddPlayer={handleAddPlayer}
        isProcessing={isProcessing}
      />

      <RemovePlayerDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        player={selectedPlayer}
        onRemove={handleRemovePlayer}
        isProcessing={isProcessing}
        isCaptain={selectedPlayer?._id === team.teamCaptain?._id}
      />

      {/* Delete Player Dialog */}
      {selectedPlayer && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Player?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete{" "}
                <strong>{selectedPlayer.playerName}</strong>? This action cannot
                be undone.
                {selectedPlayer.user && (
                  <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                      This player has a user account linked. You cannot delete
                      players with linked accounts. Please make them a free
                      agent instead.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeletePlayer(selectedPlayer._id)}
                disabled={isProcessing || selectedPlayer.user}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? "Deleting..." : "Delete Player"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <QuickCreatePlayerDialog
        open={showQuickCreateDialog}
        onOpenChange={setShowQuickCreateDialog}
        team={team}
        cityId={cityId}
        onSuccess={handleQuickCreateSuccess}
      />
    </div>
  );
}
