// src/components/features/payments/SendReminderModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Send payment reminder modal ONLY
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

interface SendReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  cityId: string;
}

export function SendReminderModal({
  open,
  onOpenChange,
  player,
  cityId,
}: SendReminderModalProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/v1/${cityId}/payments/send-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player._id,
          email: player.user?.email,
          phoneNumber: player.user?.phoneNumber,
        }),
      });

      if (!response.ok) throw new Error("Failed to send reminder");

      toast.success("Payment reminder sent successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send reminder. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
          <DialogDescription>
            Send a payment reminder to {player.playerName} via email and SMS.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600">
            This will send a reminder to:
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {player.user?.email && <li>📧 {player.user.email}</li>}
            {player.user?.phoneNumber && <li>📱 {player.user.phoneNumber}</li>}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reminder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}