// src/components/features/payments/SendPaymentLinkModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Send payment link modal ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MessageSquare, AlertCircle, Phone } from "lucide-react";
import { toast } from "sonner";

interface SendPaymentLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  payment: any;
  paymentMethod: any;
  cityId: string;
}

export function SendPaymentLinkModal({
  open,
  onOpenChange,
  player,
  payment,
  paymentMethod,
  cityId,
}: SendPaymentLinkModalProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount =
    payment.paymentNumber === 1
      ? 60
      : paymentMethod.pricingTier === "EARLY_BIRD"
      ? 25
      : 30;

  const handleSend = async () => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/${cityId}/payments/send-payment-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: player._id,
            paymentMethodId: paymentMethod._id,
            paymentNumber: payment.paymentNumber,
            amount: amount * 100, // Convert to cents
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send payment link");
      }

      toast.success("Payment link sent successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Send Payment Link
          </DialogTitle>
          <DialogDescription>
            Create and send a payment link to the player via SMS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Player:</span>
                <span className="font-medium">{player.playerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium">
                  #{payment.paymentNumber}
                  {payment.paymentNumber === 1 && " (Down Payment)"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg">${amount}.00</span>
              </div>
            </div>
          </div>

          {/* Phone Number */}
          {player.user?.phoneNumber ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  SMS will be sent to:
                </p>
                <p className="text-sm text-gray-600">
                  {player.user.phoneNumber}
                </p>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                No phone number on file for this player. Cannot send SMS.
              </AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This will create a new Stripe payment link and send it to the
              player via SMS. The player will pay when ready. Link does not
              expire.
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !player.user?.phoneNumber}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Payment Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
