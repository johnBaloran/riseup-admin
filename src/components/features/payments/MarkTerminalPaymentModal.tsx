"use client";

// src/components/features/payments/MarkTerminalPaymentModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Modal for processing terminal payment ONLY
 */

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CreditCard, Loader2, CheckCircle, XCircle, Wifi } from "lucide-react";

interface TerminalReader {
  id: string;
  label: string;
  status: "online" | "offline";
}

interface MarkTerminalPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
}

export function MarkTerminalPaymentModal({
  open,
  onOpenChange,
  player,
}: MarkTerminalPaymentModalProps) {
  const router = useRouter();
  const [readers, setReaders] = useState<TerminalReader[]>([]);
  const [selectedReader, setSelectedReader] = useState("");
  const [amount, setAmount] = useState("");
  const [pricingTier, setPricingTier] = useState<"EARLY_BIRD" | "REGULAR">("REGULAR");
  const [loading, setLoading] = useState(false);
  const [loadingReaders, setLoadingReaders] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "polling" | "succeeded" | "failed">("idle");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [cardDetails, setCardDetails] = useState<{
    brand?: string;
    last4?: string;
  }>({});

  // Fetch terminal readers
  useEffect(() => {
    if (open) {
      fetchReaders();
    }
  }, [open]);

  const fetchReaders = async () => {
    try {
      setLoadingReaders(true);
      const response = await fetch("/api/v1/terminal/readers");

      if (!response.ok) {
        throw new Error("Failed to fetch terminal readers");
      }

      const data = await response.json();
      const onlineReaders = (data.readers || []).filter(
        (r: TerminalReader) => r.status === "online"
      );
      setReaders(onlineReaders);

      // Auto-select first online reader
      if (onlineReaders.length > 0) {
        setSelectedReader(onlineReaders[0].id);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load terminal readers");
    } finally {
      setLoadingReaders(false);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (paymentIntentId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds (poll every 1 second)

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setPaymentStatus("failed");
        toast.error("Payment timeout. Please check the terminal.");
        return;
      }

      try {
        const response = await fetch(
          `/api/v1/terminal/payment-status?paymentIntentId=${paymentIntentId}`
        );

        if (!response.ok) {
          throw new Error("Failed to check payment status");
        }

        const data = await response.json();

        if (data.status === "succeeded") {
          setPaymentStatus("succeeded");
          setCardDetails({
            brand: data.cardBrand,
            last4: data.cardLast4,
          });
          toast.success("Payment successful!");

          // Close modal after 2 seconds
          setTimeout(() => {
            onOpenChange(false);
            resetForm();
            router.refresh();
          }, 2000);
          return;
        } else if (data.status === "canceled") {
          setPaymentStatus("failed");
          toast.error("Payment was canceled");
          return;
        } else if (data.status === "requires_payment_method" && attempts > 5) {
          // Only fail after 5 seconds if still waiting for card
          // This gives time for the terminal to be ready
          setPaymentStatus("failed");
          toast.error("Payment failed - no card presented");
          return;
        }

        // Still processing or waiting for card, poll again
        attempts++;
        setTimeout(poll, 1000);
      } catch (error) {
        attempts++;
        setTimeout(poll, 1000);
      }
    };

    poll();
  };

  const handleProcessPayment = async () => {
    // Validation
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedReader) {
      toast.error("Please select a terminal reader");
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus("processing");

      const response = await fetch("/api/v1/terminal/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player._id,
          readerId: selectedReader,
          amount: amountNum,
          pricingTier: pricingTier,
          divisionId: player.division._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      // Start polling for payment status
      setPaymentIntentId(data.paymentIntentId);
      setPaymentStatus("polling");
      toast.info("Please have customer present card on terminal");

      pollPaymentStatus(data.paymentIntentId);
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Failed to process payment");
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setPricingTier("REGULAR");
    setSelectedReader("");
    setPaymentStatus("idle");
    setPaymentIntentId("");
    setCardDetails({});
  };

  const handleClose = () => {
    if (paymentStatus !== "polling") {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <DialogTitle>Process Terminal Payment</DialogTitle>
          </div>
          <DialogDescription>
            Process card payment on terminal for {player.playerName}
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

          {/* Terminal Reader Selection */}
          <div className="space-y-2">
            <Label htmlFor="reader">
              Terminal Reader <span className="text-red-500">*</span>
            </Label>
            {loadingReaders ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : readers.length === 0 ? (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-900">
                No online terminal readers found. Please ensure a reader is connected
                and online, or{" "}
                <a href="/settings/terminal" className="underline font-medium">
                  register a new terminal
                </a>
                .
              </div>
            ) : (
              <Select
                value={selectedReader}
                onValueChange={setSelectedReader}
                disabled={loading || paymentStatus !== "idle"}
              >
                <SelectTrigger id="reader">
                  <SelectValue placeholder="Select a terminal" />
                </SelectTrigger>
                <SelectContent>
                  {readers.map((reader) => (
                    <SelectItem key={reader.id} value={reader.id}>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-600" />
                        {reader.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading || paymentStatus !== "idle"}
                className="pl-7"
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
              disabled={loading || paymentStatus !== "idle"}
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

          {/* Payment Status */}
          {paymentStatus === "polling" && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">
                Waiting for customer to present card...
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Please tap, insert, or swipe card on the terminal
              </p>
            </div>
          )}

          {paymentStatus === "succeeded" && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">
                Payment Successful!
              </p>
              {cardDetails.brand && cardDetails.last4 && (
                <p className="text-xs text-green-700 mt-1">
                  {cardDetails.brand} •••• {cardDetails.last4}
                </p>
              )}
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-900">
                Payment Failed
              </p>
              <p className="text-xs text-red-700 mt-1">
                Please try again or use a different payment method
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading || paymentStatus === "polling"}
          >
            {paymentStatus === "polling" ? "Please Wait..." : "Cancel"}
          </Button>
          <Button
            onClick={handleProcessPayment}
            disabled={
              loading ||
              loadingReaders ||
              readers.length === 0 ||
              paymentStatus !== "idle"
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
