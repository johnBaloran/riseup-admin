// src/components/features/league/teams/TeamCard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Single team card display ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Users,
  Trophy,
  MoreVertical,
  Pencil,
  Trash2,
  AlertCircle,
  Building2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, isBefore } from "date-fns";
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

interface TeamCardProps {
  team: any;
}

export function TeamCard({ team }: TeamCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Calculate early bird status
  const divisionStartDate = team.division?.startDate;
  const earlyBirdDeadline = divisionStartDate
    ? subDays(new Date(divisionStartDate), 42)
    : null;
  const teamCreatedAt = team.createdAt;
  const isEarlyBird =
    earlyBirdDeadline && teamCreatedAt
      ? isBefore(new Date(teamCreatedAt), earlyBirdDeadline)
      : false;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/teams?id=${team._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete team");
      }

      toast.success("Team deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete team");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const noCaptainWarning = !team.teamCaptain && team.players?.length > 0;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              {noCaptainWarning && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-200"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  No Captain
                </Badge>
              )}
              <Link href={`/admin/league/teams/${team._id}`}>
                <h3 className="font-semibold text-lg leading-tight hover:underline">
                  {team.teamName}
                </h3>
              </Link>
              <p className="text-sm text-gray-500">{team.teamNameShort}</p>
              <p className="text-xs text-gray-400 font-mono">{team.teamCode}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/league/teams/${team._id}/edit`)
                  }
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Team
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span>{team.division?.city?.cityName || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{team.division?.location?.name || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Trophy className="h-4 w-4 flex-shrink-0" />
            <span>{team.division?.divisionName || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{team.players?.length || 0} players</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs">
                {teamCreatedAt
                  ? format(new Date(teamCreatedAt), "MMM dd, yyyy")
                  : "N/A"}
              </span>
              {isEarlyBird ? (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200 text-xs"
                >
                  Early Bird
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-800 border-gray-200 text-xs"
                >
                  Regular
                </Badge>
              )}
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Record:</span>
              <span className="font-medium">
                {team.wins}-{team.losses} ({team.pointDifference > 0 ? "+" : ""}
                {team.pointDifference})
              </span>
            </div>
            {team.teamCaptain && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">Captain:</span>
                <span className="text-xs">{team.teamCaptain.playerName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{team.teamName}"? This action
              cannot be undone.
              {(team.players?.length > 0 || team.games?.length > 0) && (
                <p className="mt-2 text-red-600 font-medium">
                  This team has {team.players?.length || 0} players and{" "}
                  {team.games?.length || 0} games. Remove all players and game
                  history before deleting.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                isDeleting || team.players?.length > 0 || team.games?.length > 0
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
