// src/components/features/payments/ChargeCardModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Charge card confirmation modal ONLY
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
import { Loader2, Zap, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ChargeCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  payment: any;
  cardInfo: any;
  paymentMethod: any;
  cityId: string;
}

export function ChargeCardModal({
  open,
  onOpenChange,
  player,
  payment,
  cardInfo,
  paymentMethod,
  cityId,
}: ChargeCardModalProps) {
  const router = useRouter();
  const [isCharging, setIsCharging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount =
    payment.paymentNumber === 1
      ? 60
      : paymentMethod.pricingTier === "EARLY_BIRD"
      ? 25
      : 30;

  const brandDisplay =
    cardInfo.brand.charAt(0).toUpperCase() + cardInfo.brand.slice(1);

  const handleCharge = async () => {
    setIsCharging(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/payments/charge-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player._id,
          paymentMethodId: paymentMethod._id,
          paymentNumber: payment.paymentNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to charge card");
      }

      toast.success("Card charged successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsCharging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Charge Card
          </DialogTitle>
          <DialogDescription>
            Charge payment #{payment.paymentNumber} to customer's card on file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Charge Details */}
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
                <span className="text-gray-600">Base Amount:</span>
                <span className="font-medium">${amount}.00</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 text-xs">
                <span>+ Tax (calculated by region)</span>
                <span>Varies by province</span>
              </div>
            </div>
          </div>

          {/* Card Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {brandDisplay} ****{cardInfo.last4}
              </p>
              <p className="text-xs text-gray-500">
                Expires {cardInfo.expMonth}/{cardInfo.expYear}
              </p>
            </div>
          </div>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This will immediately charge ${amount}.00 + tax to the customer's card.
              Tax will be calculated based on the division's province. An SMS
              confirmation and Stripe receipt will be sent automatically.
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
            disabled={isCharging}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCharge}
            disabled={isCharging}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCharging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Charging...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Charge Card
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
