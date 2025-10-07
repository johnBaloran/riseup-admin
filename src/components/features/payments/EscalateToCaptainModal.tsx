// src/components/features/payments/EscalateToCaptainModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Escalate to team captain modal ONLY
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
import { Loader2, AlertOctagon } from "lucide-react";
import { toast } from "sonner";

interface EscalateToCaptainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  failedPaymentsCount: number;
  teamId: string;
  cityId: string;
}

export function EscalateToCaptainModal({
  open,
  onOpenChange,
  player,
  failedPaymentsCount,
  teamId,
  cityId,
}: EscalateToCaptainModalProps) {
  const [isEscalating, setIsEscalating] = useState(false);

  const handleEscalate = async () => {
    setIsEscalating(true);
    try {
      const response = await fetch(`/api/v1/${cityId}/payments/escalate-captain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player._id,
          teamId,
          failedPaymentsCount,
        }),
      });

      if (!response.ok) throw new Error("Failed to escalate");

      toast.success("Team captain has been notified!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to escalate. Please try again.");
    } finally {
      setIsEscalating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-orange-600" />
            Escalate to Team Captain
          </DialogTitle>
          <DialogDescription>
            Notify the team captain about {player.playerName}'s critical payment issues.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-900">Critical Payment Situation</p>
            <ul className="mt-2 space-y-1 text-sm text-orange-800">
              <li>• {failedPaymentsCount} payments have failed</li>
              <li>• Multiple reminder attempts made</li>
              <li>• Team captain intervention needed</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            The team captain will be notified via email and SMS to follow up urgently with 
            this player about completing their outstanding payments.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleEscalate} 
            disabled={isEscalating}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isEscalating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Escalating...
              </>
            ) : (
              "Escalate to Captain"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}