"use client";

// src/components/features/terminal/RegisterTerminalModal.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Register terminal modal UI ONLY
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface RegisterTerminalModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function RegisterTerminalModal({
  onClose,
  onSuccess,
}: RegisterTerminalModalProps) {
  const [formData, setFormData] = useState({
    registrationCode: "",
    label: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.registrationCode || !formData.label) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/v1/terminal/readers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register terminal");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to register terminal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register Terminal Reader</DialogTitle>
          <DialogDescription>
            Enter the pairing code displayed on your BBPOS WisePOS E terminal to
            register it with the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-semibold mb-2">On your terminal:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Power on the WisePOS E device</li>
              <li>Navigate to Settings</li>
              <li>Select "Generate Pairing Code"</li>
              <li>Copy the code shown on screen</li>
            </ol>
          </div>

          {/* Registration Code */}
          <div className="space-y-2">
            <Label htmlFor="registrationCode">
              Pairing Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="registrationCode"
              type="text"
              placeholder="e.g., ocean-storm-saturn"
              value={formData.registrationCode}
              onChange={(e) =>
                setFormData({ ...formData, registrationCode: e.target.value })
              }
              required
            />
            <p className="text-xs text-gray-600">
              The pairing code displayed on your terminal (e.g., three-word-phrase)
            </p>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">
              Terminal Label <span className="text-red-500">*</span>
            </Label>
            <Input
              id="label"
              type="text"
              placeholder="e.g., Front Desk Terminal"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              required
            />
            <p className="text-xs text-gray-600">
              A friendly name to identify this terminal (e.g., "Front Desk", "Registration Booth")
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Terminal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
