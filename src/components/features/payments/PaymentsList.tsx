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
import { Users, ExternalLink, Mail, Trophy, MapPin, Building2, Calendar } from "lucide-react";
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
        <Card key={player._id} className="hover:shadow-xl transition-all hover:border-blue-200 overflow-hidden">
          <CardContent className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate mb-1">
                  {player.playerName}
                </h3>
                {player.user?.email && (
                  <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{player.user.email}</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="ml-2"
              >
                <Link href={`/payments/${player._id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Location Info Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Team</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {player.team?.teamName || "No Team"}
                    </p>
                  </div>
                </div>

                {player.division?.day && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Day</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {player.division.day}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Division Details */}
              <div className="space-y-2 py-3 border-t border-b">
                <div className="flex items-center gap-2">
                  <Trophy className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
                  <span className="text-xs text-gray-500">Division:</span>
                  <span className="text-xs font-medium text-gray-900 truncate flex-1">
                    {player.division?.divisionName}
                  </span>
                </div>

                {player.division?.city?.cityName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-500">City:</span>
                    <span className="text-xs font-medium text-gray-900 truncate flex-1">
                      {player.division.city.cityName}
                    </span>
                  </div>
                )}

                {player.division?.location?.name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                    <span className="text-xs text-gray-500">Location:</span>
                    <span className="text-xs font-medium text-gray-900 truncate flex-1">
                      {player.division.location.name}
                    </span>
                  </div>
                )}
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
