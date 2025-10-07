// src/components/features/payments/NotifyCaptainModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Notify team captain modal ONLY
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NotifyCaptainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  teamId: string;
  cityId: string;
}

export function NotifyCaptainModal({
  open,
  onOpenChange,
  player,
  teamId,
  cityId,
}: NotifyCaptainModalProps) {
  const [isSending, setIsSending] = useState(false);

  const handleNotify = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/v1/${cityId}/payments/notify-captain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player._id,
          teamId,
        }),
      });

      if (!response.ok) throw new Error("Failed to notify captain");

      toast.success("Team captain notified successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to notify captain. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notify Team Captain</DialogTitle>
          <DialogDescription>
            Send a notification to the team captain about {player.playerName}'s
            unpaid registration.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600">
            The team captain will be notified to follow up with this player about
            completing their payment.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleNotify} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Notifying...
              </>
            ) : (
              "Notify Captain"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}