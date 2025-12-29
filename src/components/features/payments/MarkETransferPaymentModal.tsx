// src/components/features/payments/MarkETransferPaymentModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Modal for marking e-transfer payment as received ONLY
 * Supports both individual and team payments
 */

"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DollarSign, Loader2, Mail, Users } from "lucide-react";

interface PlayerPayment {
  playerId: string;
  playerName: string;
  amount: number;
  pricingTier: "EARLY_BIRD" | "REGULAR";
  selected: boolean;
}

interface MarkETransferPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
}

export function MarkETransferPaymentModal({
  open,
  onOpenChange,
  player,
}: MarkETransferPaymentModalProps) {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<"individual" | "team">(
    "individual"
  );
  const [senderEmail, setSenderEmail] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Individual payment state
  const [individualAmount, setIndividualAmount] = useState("");
  const [individualPricingTier, setIndividualPricingTier] = useState<
    "EARLY_BIRD" | "REGULAR"
  >("REGULAR");

  // Team payment state
  const [teamPlayers, setTeamPlayers] = useState<PlayerPayment[]>([]);
  const [totalETransferAmount, setTotalETransferAmount] = useState("");

  // Load team players when switching to team payment mode
  useEffect(() => {
    if (paymentType === "team" && player.team && teamPlayers.length === 0) {
      loadTeamPlayers();
    }
  }, [paymentType, player.team]);

  const loadTeamPlayers = async () => {
    try {
      const response = await fetch(
        `/api/v1/teams/${player.team._id}/unpaid-players`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load team players");
      }

      // Initialize team players with current player pre-selected
      const players: PlayerPayment[] = data.players.map((p: any) => ({
        playerId: p._id,
        playerName: p.playerName,
        amount: 0,
        pricingTier: "REGULAR" as const,
        selected: p._id === player._id, // Pre-select current player
      }));

      setTeamPlayers(players);
    } catch (error: any) {
      console.error("Error loading team players:", error);
      toast.error(error.message || "Failed to load team players");
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setTeamPlayers((prev) =>
      prev.map((p) =>
        p.playerId === playerId ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const handlePlayerAmountChange = (playerId: string, amount: string) => {
    setTeamPlayers((prev) =>
      prev.map((p) =>
        p.playerId === playerId
          ? { ...p, amount: parseFloat(amount) || 0 }
          : p
      )
    );
  };

  const handlePlayerPricingTierChange = (
    playerId: string,
    tier: "EARLY_BIRD" | "REGULAR"
  ) => {
    setTeamPlayers((prev) =>
      prev.map((p) => (p.playerId === playerId ? { ...p, pricingTier: tier } : p))
    );
  };

  const handleAutoSplitAmount = () => {
    const totalAmount = parseFloat(totalETransferAmount) || 0;
    const selectedPlayers = teamPlayers.filter((p) => p.selected);

    if (selectedPlayers.length === 0) {
      toast.error("Please select at least one player");
      return;
    }

    const amountPerPlayer = totalAmount / selectedPlayers.length;

    setTeamPlayers((prev) =>
      prev.map((p) =>
        p.selected ? { ...p, amount: amountPerPlayer } : p
      )
    );
  };

  const handleMarkAsPaid = async () => {
    try {
      setLoading(true);

      let payments: Array<{
        playerId: string;
        amount: number;
        pricingTier: "EARLY_BIRD" | "REGULAR";
      }> = [];

      if (paymentType === "individual") {
        // Individual payment
        const amountNum = parseFloat(individualAmount);
        if (!individualAmount || isNaN(amountNum) || amountNum <= 0) {
          toast.error("Please enter a valid amount");
          return;
        }

        payments = [
          {
            playerId: player._id,
            amount: amountNum,
            pricingTier: individualPricingTier,
          },
        ];
      } else {
        // Team payment
        const selectedPlayers = teamPlayers.filter((p) => p.selected);

        if (selectedPlayers.length === 0) {
          toast.error("Please select at least one player");
          return;
        }

        // Validate all selected players have amounts
        for (const p of selectedPlayers) {
          if (!p.amount || p.amount <= 0) {
            toast.error(`Please enter a valid amount for ${p.playerName}`);
            return;
          }
        }

        payments = selectedPlayers.map((p) => ({
          playerId: p.playerId,
          amount: p.amount,
          pricingTier: p.pricingTier,
        }));
      }

      const response = await fetch("/api/v1/payments/mark-etransfer-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payments: payments,
          cityId: player.division.city._id || player.division.city,
          senderEmail: senderEmail.trim(),
          referenceNumber: referenceNumber.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark payment as received");
      }

      toast.success(
        `E-transfer payment marked for ${payments.length} player(s)`
      );
      onOpenChange(false);
      resetForm();
      router.refresh();
    } catch (error: any) {
      console.error("Error marking e-transfer payment:", error);
      toast.error(error.message || "Failed to mark payment as received");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPaymentType("individual");
    setIndividualAmount("");
    setIndividualPricingTier("REGULAR");
    setSenderEmail("");
    setReferenceNumber("");
    setNotes("");
    setTeamPlayers([]);
    setTotalETransferAmount("");
  };

  const getCityETransferEmail = () => {
    return player.division?.city?.eTransferEmail || "Not configured";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <DialogTitle>Add E-Transfer Payment</DialogTitle>
          </div>
          <DialogDescription>
            Record e-transfer payment received for {player.playerName}
            {player.team && " or team"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* City E-Transfer Info */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-900">
              <strong>City E-Transfer Email:</strong> {getCityETransferEmail()}
            </p>
          </div>

          {/* Payment Type Selection */}
          {player.team && (
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <RadioGroup
                value={paymentType}
                onValueChange={(value) =>
                  setPaymentType(value as "individual" | "team")
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="font-normal cursor-pointer">
                    Individual Payment (this player only)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="team" id="team" />
                  <Label htmlFor="team" className="font-normal cursor-pointer">
                    Team Payment (captain sent for multiple players)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Individual Payment Form */}
          {paymentType === "individual" && (
            <>
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
              </div>

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
                    value={individualAmount}
                    onChange={(e) => setIndividualAmount(e.target.value)}
                    disabled={loading}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricingTier">
                  Pricing Tier <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={individualPricingTier}
                  onValueChange={(value) =>
                    setIndividualPricingTier(value as "EARLY_BIRD" | "REGULAR")
                  }
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
            </>
          )}

          {/* Team Payment Form */}
          {paymentType === "team" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">
                  Total E-Transfer Amount (Optional)
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={totalETransferAmount}
                      onChange={(e) => setTotalETransferAmount(e.target.value)}
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAutoSplitAmount}
                    disabled={!totalETransferAmount || loading}
                  >
                    Auto Split
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter total amount and click "Auto Split" to divide equally among
                  selected players
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Select Players <span className="text-red-500">*</span>
                </Label>
                <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                  {teamPlayers.map((p) => (
                    <div key={p.playerId} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`player-${p.playerId}`}
                          checked={p.selected}
                          onCheckedChange={() => handlePlayerToggle(p.playerId)}
                          disabled={loading}
                        />
                        <Label
                          htmlFor={`player-${p.playerId}`}
                          className="font-medium cursor-pointer flex-1"
                        >
                          {p.playerName}
                        </Label>
                      </div>
                      {p.selected && (
                        <div className="ml-6 grid grid-cols-2 gap-2">
                          <div>
                            <Label
                              htmlFor={`amount-${p.playerId}`}
                              className="text-xs"
                            >
                              Amount
                            </Label>
                            <Input
                              id={`amount-${p.playerId}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={p.amount || ""}
                              onChange={(e) =>
                                handlePlayerAmountChange(p.playerId, e.target.value)
                              }
                              disabled={loading}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`tier-${p.playerId}`}
                              className="text-xs"
                            >
                              Pricing Tier
                            </Label>
                            <Select
                              value={p.pricingTier}
                              onValueChange={(value) =>
                                handlePlayerPricingTierChange(
                                  p.playerId,
                                  value as "EARLY_BIRD" | "REGULAR"
                                )
                              }
                              disabled={loading}
                            >
                              <SelectTrigger id={`tier-${p.playerId}`} className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EARLY_BIRD">Early Bird</SelectItem>
                                <SelectItem value="REGULAR">Regular</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="space-y-2">
            <Label htmlFor="senderEmail">Sender Email (optional)</Label>
            <Input
              id="senderEmail"
              type="email"
              placeholder="captain@email.com"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number (optional)</Label>
            <Input
              id="referenceNumber"
              placeholder="ET12345"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Captain paid for entire team..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={loading}
            />
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
                <Mail className="mr-2 h-4 w-4" />
                Add Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
