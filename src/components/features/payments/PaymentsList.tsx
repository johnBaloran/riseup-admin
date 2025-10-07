// src/components/features/payments/PaymentsList.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display payment list with status cards ONLY
 */

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, ExternalLink, AlertCircle } from "lucide-react";
import { InstallmentProgress } from "./InstallmentProgress";

interface PaymentsListProps {
  players: any[];
  cityId: string;
}

export function PaymentsList({ players, cityId }: PaymentsListProps) {
  if (players.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No players found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your filters to see more results.
        </p>
      </Card>
    );
  }

  const getStatusBadge = (status: string, paymentMethod: any) => {
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Division
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player: any) => (
              <tr key={player._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {player.playerName}
                  </div>
                  {player.user?.email && (
                    <div className="text-sm text-gray-500">{player.user.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {player.team?.teamName || "No Team"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {player.division?.divisionName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(player.paymentStatus, player.paymentMethod)}
                </td>
                <td className="px-6 py-4">
                  {player.paymentStatus === "on-track" ||
                  player.paymentStatus === "has-issues" ||
                  player.paymentStatus === "critical" ? (
                    <InstallmentProgress
                      payments={
                        player.paymentMethod?.installments?.subscriptionPayments || []
                      }
                      size="sm"
                    />
                  ) : player.paymentStatus === "paid" ? (
                    <span className="text-sm text-green-600">Payment Complete</span>
                  ) : (
                    <span className="text-sm text-gray-500">No Payment Method</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/${cityId}/payments/${player._id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}