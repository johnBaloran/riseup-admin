// src/components/features/payments/PaymentsList.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display payment list with status cards ONLY
 */

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ExternalLink, Mail, UserCircle, Trophy } from "lucide-react";
import { InstallmentProgress } from "./InstallmentProgress";

interface PaymentsListProps {
  players: any[];
}

export function PaymentsList({ players }: PaymentsListProps) {
  if (players.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No players found
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your filters to see more results.
        </p>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Fully Paid
          </Badge>
        );
      case "on-track":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            On Track
          </Badge>
        );
      case "has-issues":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Has Issues
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Critical
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Unpaid
          </Badge>
        );
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {players.map((player: any) => (
        <Card key={player._id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <UserCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">
                    {player.playerName}
                  </h3>
                </div>
                {player.user?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{player.user.email}</span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild className="ml-2">
                <Link href={`/payments/${player._id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Team & Division */}
            <div className="space-y-2 mb-4 pb-4 border-b">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">Team:</span>
                <span className="font-medium text-gray-900 truncate">
                  {player.team?.teamName || "No Team"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600">Division:</span>
                <span className="font-medium text-gray-900 truncate">
                  {player.division?.divisionName}
                </span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Status:</span>
                {getStatusBadge(player.paymentStatus)}
              </div>

              {/* Payment Details */}
              {player.paymentStatus === "on-track" ||
              player.paymentStatus === "has-issues" ||
              player.paymentStatus === "critical" ? (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">
                    Payment Progress:
                  </p>
                  <InstallmentProgress
                    payments={
                      player.paymentMethod?.installments
                        ?.subscriptionPayments || []
                    }
                    size="md"
                  />
                </div>
              ) : player.paymentStatus === "paid" ? (
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Payment Complete
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">No Payment Method</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
