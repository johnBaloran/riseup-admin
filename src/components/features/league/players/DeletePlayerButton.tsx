// src/components/features/league/players/DeletePlayerButton.tsx

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

interface DeletePlayerButtonProps {
  playerId: string;
  playerName: string;
  hasUser: boolean;
}

export function DeletePlayerButton({
  playerId,
  playerName,
  hasUser,
}: DeletePlayerButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/v1/players?id=${playerId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete player");
      }

      toast.success("Player deleted successfully");
      router.push("/league/players");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting player:", error);
      toast.error(error.message || "Failed to delete player");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Player
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasUser ? "Cannot Delete Player" : "Delete Player"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasUser ? (
                <>
                  <span className="font-semibold">{playerName}</span> has a
                  linked user account.
                  <br />
                  <br />
                  You must unlink the user account before deleting this player.
                  Use the edit page to unlink the user account first.
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{playerName}</span>? This
                  action cannot be undone.
                  <br />
                  <br />
                  This will also remove the player from their team if they are
                  assigned to one.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {hasUser ? (
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
                  {isDeleting ? "Deleting..." : "Delete Player"}
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
