// src/components/features/league/teams/DeleteTeamButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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

interface DeleteTeamButtonProps {
  teamId: string;
  teamName: string;
  hasPlayers: boolean;
  playerCount: number;
}

export function DeleteTeamButton({
  teamId,
  teamName,
  hasPlayers,
  playerCount,
}: DeleteTeamButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/v1/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete team");
      }

      toast.success("Team deleted successfully");
      router.push("/league/teams");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast.error(error.message || "Failed to delete team");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Team
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasPlayers ? "Cannot Delete Team" : "Delete Team"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasPlayers ? (
                <>
                  <span className="font-semibold">{teamName}</span> currently
                  has {playerCount} player{playerCount !== 1 ? "s" : ""}.
                  <br />
                  <br />
                  You must remove all players from this team before it can be
                  deleted. Use the roster management section below to remove all
                  players first.
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{teamName}</span>? This action
                  cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {hasPlayers ? (
              <AlertDialogCancel>Close</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
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
