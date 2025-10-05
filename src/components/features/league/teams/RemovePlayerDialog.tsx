// src/components/features/league/teams/RemovePlayerDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Remove player confirmation dialog ONLY
 */

"use client";

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
import { AlertCircle } from "lucide-react";

interface RemovePlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  onRemove: (playerId: string) => void;
  isProcessing: boolean;
  isCaptain: boolean;
}

export function RemovePlayerDialog({
  open,
  onOpenChange,
  player,
  onRemove,
  isProcessing,
  isCaptain,
}: RemovePlayerDialogProps) {
  if (!player) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Player from Roster?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{player.playerName}</strong>{" "}
            from the team? This player will become a free agent in the division.
            {isCaptain && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  This player is the team captain. Removing them will also
                  remove the captain assignment.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onRemove(player._id)}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? "Removing..." : "Remove Player"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
