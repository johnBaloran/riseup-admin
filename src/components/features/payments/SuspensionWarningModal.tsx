// src/components/features/payments/SuspensionWarningModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Suspension warning modal ONLY
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
import { ShieldAlert } from "lucide-react";

interface SuspensionWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  failedPaymentsCount: number;
  cityId: string;
}

export function SuspensionWarningModal({
  open,
  onOpenChange,
  player,
  failedPaymentsCount,
  cityId,
}: SuspensionWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-900">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Player Suspension Consideration
          </DialogTitle>
          <DialogDescription>
            Review suspension policy for {player.playerName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <p className="text-sm font-bold text-red-900 mb-2">Critical Payment Status</p>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• {failedPaymentsCount} payments failed</li>
              <li>• Multiple collection attempts unsuccessful</li>
              <li>• League policy may require suspension</li>
            </ul>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Recommended next steps:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Final captain escalation attempt</li>
              <li>Document all communication attempts</li>
              <li>Review league suspension policy</li>
              <li>Consult with league executive before suspension</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Player suspension is a last resort. Ensure all 
              reasonable collection efforts have been exhausted before proceeding.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}