// src/components/features/league/teams/DeletePlayerDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Delete player confirmation dialog ONLY
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

interface DeletePlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  onDelete: (playerId: string) => void;
  isProcessing: boolean;
}

export function DeletePlayerDialog({
  open,
  onOpenChange,
  player,
  onDelete,
  isProcessing,
}: DeletePlayerDialogProps) {
  if (!player) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Player?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete{" "}
            <strong>{player.playerName}</strong>? This action cannot be undone.
            {player.user && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  This player has a user account linked. You cannot delete
                  players with linked accounts. Please make them a free agent
                  instead.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(player._id)}
            disabled={isProcessing || player.user}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? "Deleting..." : "Delete Player"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
