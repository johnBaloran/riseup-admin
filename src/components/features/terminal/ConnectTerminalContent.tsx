"use client";

// src/components/features/terminal/ConnectTerminalContent.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Terminal connection management UI ONLY
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { RegisterTerminalModal } from "./RegisterTerminalModal";

interface TerminalReader {
  id: string;
  label: string;
  status: "online" | "offline";
  device_type: string;
  serial_number: string;
  ip_address?: string;
}

interface ConnectTerminalContentProps {
  canManage: boolean;
}

export function ConnectTerminalContent({ canManage }: ConnectTerminalContentProps) {
  const [readers, setReaders] = useState<TerminalReader[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [error, setError] = useState("");

  const fetchReaders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/v1/terminal/readers");

      if (!response.ok) {
        throw new Error("Failed to fetch terminal readers");
      }

      const data = await response.json();
      setReaders(data.readers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load terminal readers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReaders();
  }, []);

  const handleDeleteReader = async (readerId: string) => {
    if (!confirm("Are you sure you want to unregister this terminal reader?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/terminal/readers?readerId=${readerId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete terminal reader");
      }

      // Refresh list
      await fetchReaders();
    } catch (err: any) {
      alert(err.message || "Failed to delete terminal reader");
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    fetchReaders();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Register Button */}
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setShowRegisterModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register Terminal
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Readers List */}
      {readers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Wifi className="h-16 w-16 mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Terminal Readers
          </h3>
          <p className="text-gray-600 mb-6">
            Register your first terminal reader to start accepting in-person card payments.
          </p>
          {canManage && (
            <Button onClick={() => setShowRegisterModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Register Terminal
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {readers.map((reader) => (
            <Card key={reader.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {reader.status === "online" ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{reader.label}</h3>
                    <span
                      className={`text-xs font-medium ${
                        reader.status === "online"
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {reader.status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReader(reader.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Device Type:</span>
                  <span className="font-medium text-gray-900">
                    {reader.device_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Serial Number:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {reader.serial_number}
                  </span>
                </div>
                {reader.ip_address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-mono text-xs text-gray-900">
                      {reader.ip_address}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={fetchReaders}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Register Terminal Modal */}
      {showRegisterModal && (
        <RegisterTerminalModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}
