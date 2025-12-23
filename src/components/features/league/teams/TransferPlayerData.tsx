// src/components/features/league/teams/TransferPlayerData.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Transfer player data between players
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransferPlayerDataProps {
  team: any;
}

interface TransferOptions {
  allStats: boolean;
  averageStats: boolean;
  jerseyNumber: boolean;
  jerseySize: boolean;
  jerseyName: boolean;
}

export function TransferPlayerData({ team }: TransferPlayerDataProps) {
  const router = useRouter();
  const [sourcePlayerId, setSourcePlayerId] = useState<string>("");
  const [targetPlayerId, setTargetPlayerId] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferOptions, setTransferOptions] = useState<TransferOptions>({
    allStats: true,
    averageStats: true,
    jerseyNumber: true,
    jerseySize: true,
    jerseyName: true,
  });

  const players = team.players || [];
  const sourcePlayer = players.find((p: any) => p._id === sourcePlayerId);
  const targetPlayer = players.find((p: any) => p._id === targetPlayerId);

  const handleTransferOptionChange = (
    option: keyof TransferOptions,
    checked: boolean
  ) => {
    setTransferOptions((prev) => ({ ...prev, [option]: checked }));
  };

  const handleInitiateTransfer = () => {
    if (!sourcePlayerId || !targetPlayerId) {
      toast.error("Please select both source and target players");
      return;
    }

    if (sourcePlayerId === targetPlayerId) {
      toast.error("Source and target players must be different");
      return;
    }

    const hasSelectedOption = Object.values(transferOptions).some(
      (value) => value
    );
    if (!hasSelectedOption) {
      toast.error("Please select at least one data type to transfer");
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmTransfer = async () => {
    setIsTransferring(true);

    try {
      const response = await fetch(`/api/v1/players/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePlayerId,
          targetPlayerId,
          transferOptions,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to transfer data");
      }

      toast.success("Player data swapped successfully");
      setShowConfirmDialog(false);
      setSourcePlayerId("");
      setTargetPlayerId("");
      setTransferOptions({
        allStats: true,
        averageStats: true,
        jerseyNumber: true,
        jerseySize: true,
        jerseyName: true,
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to transfer data");
      console.error("Transfer error:", error);
    } finally {
      setIsTransferring(false);
    }
  };

  if (!players || players.length < 2) {
    return null; // Don't show if less than 2 players
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            <CardTitle>Swap Player Data</CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Swap stats and jersey information between two players
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="sourcePlayer">Player 1</Label>
              <Select value={sourcePlayerId} onValueChange={setSourcePlayerId}>
                <SelectTrigger id="sourcePlayer">
                  <SelectValue placeholder="Select first player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player: any) => (
                    <SelectItem
                      key={player._id}
                      value={player._id}
                      disabled={player._id === targetPlayerId}
                    >
                      {player.playerName}
                      {player.jerseyNumber != null && ` (#${player.jerseyNumber})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetPlayer">Player 2</Label>
              <Select value={targetPlayerId} onValueChange={setTargetPlayerId}>
                <SelectTrigger id="targetPlayer">
                  <SelectValue placeholder="Select second player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player: any) => (
                    <SelectItem
                      key={player._id}
                      value={player._id}
                      disabled={player._id === sourcePlayerId}
                    >
                      {player.playerName}
                      {player.jerseyNumber != null && ` (#${player.jerseyNumber})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transfer Options */}
          {sourcePlayerId && targetPlayerId && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-sm mb-3">
                Select data to swap:
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {/* Stats */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Statistics</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allStats"
                      checked={transferOptions.allStats}
                      onCheckedChange={(checked) =>
                        handleTransferOptionChange("allStats", checked as boolean)
                      }
                    />
                    <Label htmlFor="allStats" className="text-sm font-normal">
                      All Game Stats
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="averageStats"
                      checked={transferOptions.averageStats}
                      onCheckedChange={(checked) =>
                        handleTransferOptionChange(
                          "averageStats",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="averageStats" className="text-sm font-normal">
                      Average Stats
                    </Label>
                  </div>
                </div>

                {/* Jersey Info */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Jersey Information
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jerseyNumber"
                      checked={transferOptions.jerseyNumber}
                      onCheckedChange={(checked) =>
                        handleTransferOptionChange(
                          "jerseyNumber",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="jerseyNumber" className="text-sm font-normal">
                      Jersey Number
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jerseySize"
                      checked={transferOptions.jerseySize}
                      onCheckedChange={(checked) =>
                        handleTransferOptionChange("jerseySize", checked as boolean)
                      }
                    />
                    <Label htmlFor="jerseySize" className="text-sm font-normal">
                      Jersey Size
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jerseyName"
                      checked={transferOptions.jerseyName}
                      onCheckedChange={(checked) =>
                        handleTransferOptionChange("jerseyName", checked as boolean)
                      }
                    />
                    <Label htmlFor="jerseyName" className="text-sm font-normal">
                      Jersey Name
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          {sourcePlayerId && targetPlayerId && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Info:</p>
                <p>
                  This will swap selected data between{" "}
                  <strong>{sourcePlayer?.playerName}</strong> and{" "}
                  <strong>{targetPlayer?.playerName}</strong>. Both players will
                  exchange their data for the selected fields.
                </p>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleInitiateTransfer}
            disabled={!sourcePlayerId || !targetPlayerId || isTransferring}
            className="w-full"
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Swap Data
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Swap</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  You are about to swap data between{" "}
                  <strong>{sourcePlayer?.playerName}</strong> and{" "}
                  <strong>{targetPlayer?.playerName}</strong>:
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Data to swap:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {transferOptions.allStats && (
                      <Badge variant="outline">All Stats</Badge>
                    )}
                    {transferOptions.averageStats && (
                      <Badge variant="outline">Average Stats</Badge>
                    )}
                    {transferOptions.jerseyNumber && (
                      <Badge variant="outline">Jersey Number</Badge>
                    )}
                    {transferOptions.jerseySize && (
                      <Badge variant="outline">Jersey Size</Badge>
                    )}
                    {transferOptions.jerseyName && (
                      <Badge variant="outline">Jersey Name</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-blue-600 font-medium">
                  Both players will exchange their selected data.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTransferring}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmTransfer}
              disabled={isTransferring}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTransferring ? "Swapping..." : "Confirm Swap"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
