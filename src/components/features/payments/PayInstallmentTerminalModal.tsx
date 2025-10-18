"use client";

// src/components/features/payments/PayInstallmentTerminalModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Modal for processing failed installment payment via terminal ONLY
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

interface PayInstallmentTerminalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  payment: any;
  paymentMethod: any;
  cityId: string;
}

export function PayInstallmentTerminalModal({
  open,
  onOpenChange,
  player,
  payment,
  paymentMethod,
  cityId,
}: PayInstallmentTerminalModalProps) {
  const router = useRouter();
  const [readers, setReaders] = useState<TerminalReader[]>([]);
  const [selectedReader, setSelectedReader] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReaders, setLoadingReaders] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "polling" | "succeeded" | "failed"
  >("idle");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [cardDetails, setCardDetails] = useState<{
    brand?: string;
    last4?: string;
  }>({});

  // Calculate installment amount
  const installmentAmount =
    payment.paymentNumber === 1
      ? 60
      : paymentMethod.pricingTier === "EARLY_BIRD"
      ? 25
      : 30;

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

  // Poll payment status after processing
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
          `/api/v1/payments/update-installment-status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check payment status");
        }

        const data = await response.json();

        if (data.status === "COMPLETED" || data.status === "IN_PROGRESS") {
          // Payment succeeded and installment updated
          setPaymentStatus("succeeded");
          toast.success("Installment payment successful!");

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
        }

        // Check the underlying payment intent status
        const statusResponse = await fetch(
          `/api/v1/terminal/payment-status?paymentIntentId=${paymentIntentId}`
        );

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();

          if (statusData.status === "succeeded") {
            // Payment succeeded, continue polling for status update
            attempts++;
            setTimeout(poll, 1000);
            return;
          } else if (statusData.status === "canceled") {
            setPaymentStatus("failed");
            toast.error("Payment was canceled");
            return;
          } else if (
            statusData.status === "requires_payment_method" &&
            attempts > 50
          ) {
            // Only fail after 50 seconds if still waiting for card
            // This gives plenty of time for customer to present card
            setPaymentStatus("failed");
            toast.error("Payment failed - no card presented");
            return;
          }
        }

        // Still processing, poll again
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
    if (!selectedReader) {
      toast.error("Please select a terminal reader");
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus("processing");

      const response = await fetch("/api/v1/payments/pay-installment-terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: paymentMethod._id,
          installmentInvoiceId: payment.invoiceId,
          readerId: selectedReader,
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
    setSelectedReader("");
    setPaymentStatus("idle");
    setPaymentIntentId("");
    setCardDetails({});
  };

  const handleCancelPayment = async () => {
    if (!paymentIntentId || !selectedReader) return;

    try {
      // Cancel the reader action
      await fetch(`/api/v1/terminal/cancel-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          readerId: selectedReader,
        }),
      });

      setPaymentStatus("failed");
      toast.error("Payment canceled");
    } catch (error) {
      console.error("Error canceling payment:", error);
    }
  };

  const handleClose = () => {
    if (paymentStatus !== "polling") {
      onOpenChange(false);
      resetForm();
    } else {
      // Ask for confirmation if payment is in progress
      if (confirm("Payment is in progress. Are you sure you want to cancel?")) {
        handleCancelPayment();
        onOpenChange(false);
        resetForm();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
            <DialogTitle>Pay Installment via Terminal</DialogTitle>
          </div>
          <DialogDescription>
            Process installment payment on terminal for {player.playerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Info */}
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Player:</span>
              <span className="font-medium">{player.playerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Installment:</span>
              <span className="font-medium">
                Payment #{payment.paymentNumber}
                {payment.paymentNumber === 1 && " (Down Payment)"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount (incl. tax):</span>
              <span className="font-bold text-purple-900">
                ${installmentAmount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pricing Tier:</span>
              <span className="font-medium">
                {paymentMethod.pricingTier === "EARLY_BIRD"
                  ? "Early Bird"
                  : "Regular"}
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
                No online terminal readers found. Please ensure a reader is
                connected and online, or{" "}
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
                Installment Payment Successful!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Payment #{payment.paymentNumber} has been marked as paid
              </p>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-900">Payment Failed</p>
              <p className="text-xs text-red-700 mt-1">
                Please try again or use a different payment method
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {paymentStatus === "polling" ? (
            <Button variant="destructive" onClick={handleCancelPayment}>
              Cancel Payment
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessPayment}
                disabled={
                  loading ||
                  loadingReaders ||
                  readers.length === 0 ||
                  paymentStatus !== "idle"
                }
                className="bg-purple-600 hover:bg-purple-700"
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
