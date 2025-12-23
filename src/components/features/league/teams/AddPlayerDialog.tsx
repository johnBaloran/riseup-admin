// src/components/features/league/teams/AddPlayerDialog.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Add player dialog ONLY
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from "lucide-react";

interface AddPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freeAgents: any[];
  onAddPlayer: (playerId: string) => void;
  isProcessing: boolean;
}

export function AddPlayerDialog({
  open,
  onOpenChange,
  freeAgents,
  onAddPlayer,
  isProcessing,
}: AddPlayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Player to Roster</DialogTitle>
          <DialogDescription>
            Select a free agent from this division to add to the team
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {freeAgents.map((player) => (
              <div
                key={player._id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 font-bold text-gray-600">
                    {player.jerseyNumber != null ? player.jerseyNumber : "—"}
                  </div>
                  <div>
                    <p className="font-medium">{player.playerName}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onAddPlayer(player._id)}
                  disabled={isProcessing}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
