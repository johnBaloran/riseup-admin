// src/components/features/payments/PaidPlayerView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Fully paid player detail view ONLY
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  Instagram as InstagramIcon,
  Calendar,
  Users,
  MapPin,
  CreditCard,
  DollarSign,
  User,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { RevertCashPaymentModal } from "./RevertCashPaymentModal";

interface PaidPlayerViewProps {
  player: any;
  paymentMethod: any;
  cityId: string;
}

export function PaidPlayerView({
  player,
  paymentMethod,
  cityId,
}: PaidPlayerViewProps) {
  const [showRevertModal, setShowRevertModal] = useState(false);
  const isCashPayment = paymentMethod?.paymentType === "CASH";
  const isETransferPayment = paymentMethod?.paymentType === "E_TRANSFER";

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
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Payment Complete
          </Badge>
        </div>
        <p className="text-gray-600">
          {player.team?.teamName || "No Team"} • {player.division?.divisionName}
        </p>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-900">All Set!</p>
          <p className="text-sm text-green-700 mt-1">
            Payment completed. No further action required.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Payment Type</p>
                  <p className="font-medium">
                    {paymentMethod.paymentType === "FULL_PAYMENT"
                      ? "Full Payment"
                      : paymentMethod.paymentType === "CASH"
                      ? "Cash Payment"
                      : paymentMethod.paymentType === "TERMINAL"
                      ? "Terminal Payment"
                      : paymentMethod.paymentType === "E_TRANSFER"
                      ? "E-Transfer"
                      : "Installments"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">Completed</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium">
                    {isCashPayment && paymentMethod.cashPayment?.paidDate
                      ? format(
                          new Date(paymentMethod.cashPayment.paidDate),
                          "MMM dd, yyyy 'at' h:mm a"
                        )
                      : paymentMethod.createdAt
                      ? format(
                          new Date(paymentMethod.createdAt),
                          "MMM dd, yyyy"
                        )
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-400">
                    {paymentMethod.pricingTier === "EARLY_BIRD" ? "EB" : "R"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pricing Tier</p>
                  <p className="font-medium">
                    {paymentMethod.pricingTier === "EARLY_BIRD"
                      ? "Early Bird"
                      : "Regular"}
                  </p>
                </div>
              </div>

              {/* Cash Payment Specific Details */}
              {isCashPayment && paymentMethod.cashPayment && (
                <>
                  <div className="pt-3 border-t" />

                  {paymentMethod.cashPayment.receivedBy && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Received By</p>
                        <p className="font-medium">
                          {typeof paymentMethod.cashPayment.receivedBy ===
                          "object"
                            ? paymentMethod.cashPayment.receivedBy.name ||
                              paymentMethod.cashPayment.receivedBy.email
                            : paymentMethod.cashPayment.receivedBy}
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod.cashPayment.notes && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="font-medium text-sm">
                          {paymentMethod.cashPayment.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Amount Received</p>
                      <p className="font-medium">
                        ${paymentMethod.originalPrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* E-Transfer Payment Specific Details */}
              {isETransferPayment &&
                paymentMethod.eTransferPayments &&
                paymentMethod.eTransferPayments.length > 0 && (
                  <>
                    <div className="pt-3 border-t" />

                    <div className="space-y-4">
                      <p className="text-sm font-medium text-gray-700">
                        E-Transfer Payments ({paymentMethod.eTransferPayments.length})
                      </p>

                      {paymentMethod.eTransferPayments.map(
                        (transfer: any, index: number) => (
                          <div
                            key={index}
                            className="rounded-lg bg-purple-50 border border-purple-200 p-3 space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-purple-900">
                                  E-Transfer #{index + 1}
                                </p>
                                <p className="text-xs text-purple-600">
                                  {transfer.paidDate
                                    ? format(
                                        new Date(transfer.paidDate),
                                        "MMM dd, yyyy 'at' h:mm a"
                                      )
                                    : "Date unknown"}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-purple-900">
                                ${transfer.amount?.toFixed(2)}
                              </p>
                            </div>

                            {transfer.city && (
                              <div className="text-xs text-purple-700">
                                <span className="font-medium">City:</span>{" "}
                                {typeof transfer.city === "object"
                                  ? transfer.city.cityName
                                  : transfer.city}
                              </div>
                            )}

                            {transfer.senderEmail && (
                              <div className="text-xs text-purple-700">
                                <span className="font-medium">From:</span>{" "}
                                {transfer.senderEmail}
                              </div>
                            )}

                            {transfer.referenceNumber && (
                              <div className="text-xs text-purple-700">
                                <span className="font-medium">Ref:</span>{" "}
                                {transfer.referenceNumber}
                              </div>
                            )}

                            {transfer.notes && (
                              <div className="text-xs text-purple-700">
                                <span className="font-medium">Notes:</span>{" "}
                                {transfer.notes}
                              </div>
                            )}

                            {transfer.receivedBy && (
                              <div className="text-xs text-purple-700">
                                <span className="font-medium">Received by:</span>{" "}
                                {typeof transfer.receivedBy === "object"
                                  ? transfer.receivedBy.name ||
                                    transfer.receivedBy.email
                                  : transfer.receivedBy}
                              </div>
                            )}
                          </div>
                        )
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Total Received</p>
                          <p className="font-medium">
                            ${paymentMethod.amountPaid?.toFixed(2)} / $
                            {paymentMethod.originalPrice?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
            </CardContent>
          </Card>

          {/* Player Information */}
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
                      ? format(new Date(player.createdAt), "MMM dd, yyyy")
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

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <p className="font-medium text-green-900 mb-1">
                  Payment Complete
                </p>
                <p className="text-sm text-gray-500">
                  {paymentMethod.createdAt
                    ? format(new Date(paymentMethod.createdAt), "MMM dd, yyyy")
                    : "Date unknown"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions - Only for Cash Payments */}
          {isCashPayment && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowRevertModal(true)}
                >
                  Delete Cash Payment
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Remove payment record completely
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Registration Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="w-0.5 h-full bg-green-500" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Player Registered</p>
                    <p className="text-xs text-gray-500">
                      {player.createdAt
                        ? format(new Date(player.createdAt), "MMM dd, yyyy")
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="w-0.5 h-full bg-green-500" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Payment Completed</p>
                    <p className="text-xs text-gray-500">
                      {paymentMethod.createdAt
                        ? format(
                            new Date(paymentMethod.createdAt),
                            "MMM dd, yyyy"
                          )
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ready to Play</p>
                    <p className="text-xs text-gray-500">All set!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revert Cash Payment Modal */}
      <RevertCashPaymentModal
        open={showRevertModal}
        onOpenChange={setShowRevertModal}
        player={player}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
