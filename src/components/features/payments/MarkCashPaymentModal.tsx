// src/components/features/payments/MarkCashPaymentModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Modal for marking cash payment as received ONLY
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Loader2 } from "lucide-react";

interface MarkCashPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
}

export function MarkCashPaymentModal({
  open,
  onOpenChange,
  player,
}: MarkCashPaymentModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [pricingTier, setPricingTier] = useState<"EARLY_BIRD" | "REGULAR">("REGULAR");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMarkAsPaid = async () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/v1/payments/mark-cash-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player._id,
          amount: amountNum,
          pricingTier: pricingTier,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark payment as received");
      }

      toast.success("Cash payment marked as received");
      onOpenChange(false);
      setAmount("");
      setPricingTier("REGULAR");
      setNotes("");
      router.refresh();
    } catch (error: any) {
      console.error("Error marking cash payment:", error);
      toast.error(error.message || "Failed to mark payment as received");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <DialogTitle>Mark Cash Payment Received</DialogTitle>
          </div>
          <DialogDescription>
            Confirm that you have received cash payment from {player.playerName}
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
              <span className="text-gray-600">Division:</span>
              <span className="font-medium">
                {player.division?.divisionName}
              </span>
            </div>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount Received <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="pl-9"
              />
            </div>
          </div>

          {/* Pricing Tier Field */}
          <div className="space-y-2">
            <Label htmlFor="pricingTier">
              Pricing Tier <span className="text-red-500">*</span>
            </Label>
            <Select
              value={pricingTier}
              onValueChange={(value) => setPricingTier(value as "EARLY_BIRD" | "REGULAR")}
              disabled={loading}
            >
              <SelectTrigger id="pricingTier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EARLY_BIRD">Early Bird</SelectItem>
                <SelectItem value="REGULAR">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes (optional)
              <span className="text-xs text-gray-500 ml-2">
                Add any details about the payment
              </span>
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g., Paid in full, received $100 bills..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Confirmation Info */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-900">
              <strong>Note:</strong> This action will mark the payment as
              completed and record you as the admin who received it. The payment
              status will be updated immediately.
            </p>
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
          <Button onClick={handleMarkAsPaid} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Mark as Received
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
