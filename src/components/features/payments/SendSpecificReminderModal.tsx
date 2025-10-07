// src/components/features/payments/SendSpecificReminderModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Send specific payment reminder modal ONLY
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
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SendSpecificReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  payment: any;
  cityId: string;
}

export function SendSpecificReminderModal({
  open,
  onOpenChange,
  player,
  payment,
  cityId,
}: SendSpecificReminderModalProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/v1/${cityId}/payments/send-specific-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player._id,
          paymentNumber: payment.paymentNumber,
          paymentLink: payment.paymentLink,
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
            Send SMS reminder for Payment #{payment.paymentNumber} to {player.playerName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Payment Details:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Payment #{payment.paymentNumber}</li>
              <li>• Failed {payment.attemptCount || 1} time(s)</li>
              <li>• Will send SMS to: {player.user?.phoneNumber || "No phone"}</li>
            </ul>
          </div>

          {payment.paymentLink && (
  <div className="text-sm">
    <p className="text-gray-600 mb-2">Payment link will be included:</p>
    <a
      href={payment.paymentLink}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline flex items-center gap-1"
    >
      View Stripe Invoice
      <ExternalLink className="h-3 w-3" />
    </a>
  </div>
)}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !player.user?.phoneNumber}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send SMS Reminder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}