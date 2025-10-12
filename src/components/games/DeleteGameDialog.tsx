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
          <AlertDialogTitle>Delete Published Game?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>This game has been published and is visible to players.</p>
            {isCompleted && (
              <p className="text-orange-600 font-medium">
                ⚠️ This game has been completed. Deleting it will remove all
                player stats and adjust team records.
              </p>
            )}
            <p className="font-medium text-foreground mt-2">Game: {gameName}</p>
            <p>Are you sure you want to delete it?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Game"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
