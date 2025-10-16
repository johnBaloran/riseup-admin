// src/components/features/payments/RevertCashPaymentModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Modal for reverting cash payment ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

interface RevertCashPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  paymentMethod: any;
}

export function RevertCashPaymentModal({
  open,
  onOpenChange,
  player,
  paymentMethod,
}: RevertCashPaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRevert = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/v1/payments/mark-cash-paid", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revert payment");
      }

      toast.success("Cash payment deleted successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error reverting cash payment:", error);
      toast.error(error.message || "Failed to revert payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <DialogTitle>Delete Cash Payment</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this cash payment record? This will completely remove the payment and mark the player as unpaid.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Player Info */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Player:</span>
              <span className="font-medium">{player.playerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Team:</span>
              <span className="font-medium">
                {player.team?.teamName || "No Team"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                ${paymentMethod?.originalPrice?.toFixed(2) || "0.00"}
              </span>
            </div>
            {paymentMethod?.cashPayment?.paidDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Date:</span>
                <span className="font-medium">
                  {new Date(paymentMethod.cashPayment.paidDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {paymentMethod?.cashPayment?.receivedBy && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Received By:</span>
                <span className="font-medium">
                  {typeof paymentMethod.cashPayment.receivedBy === 'object'
                    ? paymentMethod.cashPayment.receivedBy.name
                    : paymentMethod.cashPayment.receivedBy}
                </span>
              </div>
            )}
            {paymentMethod?.cashPayment?.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-600 mb-1">Notes:</p>
                <p className="text-sm">{paymentMethod.cashPayment.notes}</p>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
            <p className="text-xs text-orange-900">
              <strong>Warning:</strong> This action will:
            </p>
            <ul className="text-xs text-orange-900 mt-2 space-y-1 list-disc list-inside">
              <li>Permanently delete the cash payment record</li>
              <li>Remove the payment from the player's payment methods</li>
              <li>Mark the player as unpaid</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevert}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
