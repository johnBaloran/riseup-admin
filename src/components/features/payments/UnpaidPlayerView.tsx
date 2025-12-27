// src/components/features/payments/UnpaidPlayerView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Unpaid player detail view ONLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertCircle,
  Mail,
  Phone,
  Instagram as InstagramIcon,
  Calendar,
  Users,
  MapPin,
} from "lucide-react";
import { SendReminderModal } from "./SendReminderModal";
import { NotifyCaptainModal } from "./NotifyCaptainModal";
import { MarkCashPaymentModal } from "./MarkCashPaymentModal";
import { MarkTerminalPaymentModal } from "./MarkTerminalPaymentModal";
import { formatDistanceToNow } from "date-fns";

interface UnpaidPlayerViewProps {
  player: any;
  cityId: string;
}

export function UnpaidPlayerView({ player, cityId }: UnpaidPlayerViewProps) {
  const router = useRouter();
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCaptainModal, setShowCaptainModal] = useState(false);
  const [showCashPaymentModal, setShowCashPaymentModal] = useState(false);
  const [showTerminalPaymentModal, setShowTerminalPaymentModal] = useState(false);

  const daysSinceRegistration = player.createdAt
    ? Math.floor(
        (Date.now() - new Date(player.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/payments`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Link>
        </Button>
      </div>

      {/* Player Overview */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {player.playerName}
          </h1>
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Payment Required
          </Badge>
        </div>
        <p className="text-gray-600">
          {player.team?.teamName || "No Team"} • {player.division?.divisionName}
        </p>
      </div>

      {/* Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-900">No Payment Method on File</p>
          <p className="text-sm text-red-700 mt-1">
            Registered {daysSinceRegistration} days ago. Payment required to
            participate.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Player Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Team</p>
                  <p className="font-medium">
                    {player.team?.teamName || "No Team Assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Division</p>
                  <p className="font-medium">{player.division?.divisionName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Registration Date</p>
                  <p className="font-medium">
                    {player.createdAt
                      ? new Date(player.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {player.user?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{player.user.email}</p>
                  </div>
                </div>
              )}

              {player.user?.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{player.user.phoneNumber}</p>
                  </div>
                </div>
              )}

              {player.instagram && (
                <div className="flex items-center gap-3">
                  <InstagramIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Instagram</p>
                    <p className="font-medium">{player.instagram}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowTerminalPaymentModal(true)}
              >
                Process Terminal Payment
              </Button>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setShowCashPaymentModal(true)}
              >
                Mark Cash Payment Received
              </Button>

              <Button
                className="w-full"
                onClick={() => setShowReminderModal(true)}
              >
                Send Payment Reminder
              </Button>

              {player.team && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCaptainModal(true)}
                >
                  Notify Team Captain
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
                <p className="text-sm text-gray-500">
                  No payment method on file
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Player needs to complete registration
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <MarkTerminalPaymentModal
        open={showTerminalPaymentModal}
        onOpenChange={setShowTerminalPaymentModal}
        player={player}
      />

      <MarkCashPaymentModal
        open={showCashPaymentModal}
        onOpenChange={setShowCashPaymentModal}
        player={player}
      />

      <SendReminderModal
        open={showReminderModal}
        onOpenChange={setShowReminderModal}
        player={player}
      />

      {player.team && (
        <NotifyCaptainModal
          open={showCaptainModal}
          onOpenChange={setShowCaptainModal}
          player={player}
          teamId={player.team._id}
          cityId={cityId}
        />
      )}
    </div>
  );
}
