// src/components/games/DeleteGameDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Delete confirmation dialog ONLY
 *
 * Reusable confirmation modal
 */

"use client";

import { useState } from "react";
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

interface DeleteGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  gameName: string;
  isPublished: boolean;
  isCompleted?: boolean;
}

export function DeleteGameDialog({
  open,
  onOpenChange,
  onConfirm,
  gameName,
  isPublished,
  isCompleted = false,
}: DeleteGameDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (isCompleted) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isCompleted ? "Cannot Delete Game" : "Delete Game?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 pt-2">
            {isCompleted ? (
              <p className="text-red-600 font-medium">
                This game has been completed and recorded. It cannot be
                deleted to preserve historical data and stats.
              </p>
            ) : isPublished ? (
              <p>
                This game is <span className="font-medium">published</span> and
                visible to players. Deleting it will remove it from the
                schedule.
              </p>
            ) : (
              <p>This game is a draft and has not been published yet.</p>
            )}
            <p className="font-medium text-foreground mt-2">Game: {gameName}</p>
            {!isCompleted && <p>Are you sure you want to delete it?</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {!isCompleted && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Game"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
