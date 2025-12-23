// src/components/features/league/divisions/DivisionTeamsSection.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display teams in a division with add team functionality
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, UserCheck, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddTeamDialog } from "./AddTeamDialog";
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

interface DivisionTeamsSectionProps {
  teams: any[];
  division: any;
}

export function DivisionTeamsSection({
  teams,
  division,
}: DivisionTeamsSectionProps) {
  const router = useRouter();
  const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    teamId: string;
    teamName: string;
    hasPlayers: boolean;
    playerCount: number;
  }>({
    open: false,
    teamId: "",
    teamName: "",
    hasPlayers: false,
    playerCount: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  console.log("DivisionTeamsSection Render:", { teams, division });

  const handleDeleteClick = (e: React.MouseEvent, team: any) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling

    const hasPlayers = team.players && team.players.length > 0;
    const playerCount = team.players?.length || 0;

    setDeleteDialog({
      open: true,
      teamId: team._id,
      teamName: team.teamName,
      hasPlayers,
      playerCount,
    });
  };

  const handleDeleteTeam = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/v1/teams/${deleteDialog.teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete team");
      }

      toast.success("Team deleted successfully");
      setDeleteDialog({
        open: false,
        teamId: "",
        teamName: "",
        hasPlayers: false,
        playerCount: 0,
      });
      router.refresh(); // Refresh the page data
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast.error(error.message || "Failed to delete team");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teams ({teams.length})
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddTeamDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-900">
                No teams yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding the first team to this division
              </p>
              <Button
                onClick={() => setShowAddTeamDialog(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team: any) => {
                return (
                  <div key={team._id} className="relative">
                    <Link href={`/league/teams/${team._id}`} className="block">
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                              {team.teamName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {team.teamCode}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, team)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete team"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {/* Players Count */}
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {team.players?.length || 0} player
                              {team.players?.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Captain */}
                          <div className="flex items-center gap-2">
                            {team.teamCaptain ? (
                              <>
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-600 line-clamp-1">
                                  {team.teamCaptain.playerName}
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-sm text-gray-500">
                                  No captain assigned
                                </span>
                              </>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {team.players?.length === 0 && (
                              <Badge
                                variant="outline"
                                className="bg-orange-50 text-orange-700 border-orange-200"
                              >
                                No Players
                              </Badge>
                            )}
                            {team.players?.length > 0 && !team.teamCaptain && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 border-yellow-200"
                              >
                                Needs Captain
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTeamDialog
        open={showAddTeamDialog}
        onOpenChange={setShowAddTeamDialog}
        division={division}
      />

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.hasPlayers ? "Cannot Delete Team" : "Delete Team"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.hasPlayers ? (
                <>
                  <span className="font-semibold">{deleteDialog.teamName}</span>{" "}
                  currently has {deleteDialog.playerCount} player
                  {deleteDialog.playerCount !== 1 ? "s" : ""}.
                  <br />
                  <br />
                  You must remove all players from this team before it can be
                  deleted. Please go to the team page and remove all players
                  first.
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{deleteDialog.teamName}</span>
                  ? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {deleteDialog.hasPlayers ? (
              <>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    window.location.href = `/league/teams/${deleteDialog.teamId}`;
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Team Page
                </AlertDialogAction>
              </>
            ) : (
              <>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTeam}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Team"}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
