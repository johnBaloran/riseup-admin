// src/components/features/payments/CriticalPlayerView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Critical installment player detail view ONLY
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertOctagon,
  Mail,
  Phone,
  Instagram as InstagramIcon,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { SendSpecificReminderModal } from "./SendSpecificReminderModal";
import { EscalateToCaptainModal } from "./EscalateToCaptainModal";
import { SuspensionWarningModal } from "./SuspensionWarningModal";
import { PayInstallmentTerminalModal } from "./PayInstallmentTerminalModal";
import { CreditCard } from "lucide-react";

interface CriticalPlayerViewProps {
  player: any;
  paymentMethod: any;
  cityId: string;
}

export function CriticalPlayerView({
  player,
  paymentMethod,
  cityId,
}: CriticalPlayerViewProps) {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showTerminalModal, setShowTerminalModal] = useState(false);

  const subscriptionPayments =
    paymentMethod.installments?.subscriptionPayments || [];
  const completedPayments = subscriptionPayments.filter(
    (p: any) => p.status === "succeeded"
  ).length;
  const failedPayments = subscriptionPayments.filter(
    (p: any) => p.status === "failed"
  );
  const totalPayments = 8;
  const progressPercentage = Math.round(
    (completedPayments / totalPayments) * 100
  );

  const daysSinceRegistration = player.createdAt
    ? Math.floor(
        (Date.now() - new Date(player.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const handleSendReminder = (payment: any) => {
    setSelectedPayment(payment);
    setShowReminderModal(true);
  };

  const handlePayViaTerminal = (payment: any) => {
    setSelectedPayment(payment);
    setShowTerminalModal(true);
  };

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
            <AlertOctagon className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        </div>
        <p className="text-gray-600">
          {player.team?.teamName || "No Team"} • {player.division?.divisionName}
        </p>
      </div>

      {/* Critical Alert */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
        <AlertOctagon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-900">Immediate Action Required</p>
          <p className="text-sm text-red-700 mt-1">
            {failedPayments.length} payments failed. Registered{" "}
            {daysSinceRegistration} days ago. Escalation or suspension
            consideration needed.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Failed Payments */}
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">
                Critical Payment Failures ({failedPayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {failedPayments.map((payment: any) => (
                <div
                  key={payment.paymentNumber}
                  className="bg-white border-2 border-red-300 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-red-900">
                        Payment #{payment.paymentNumber}
                        {payment.paymentNumber === 1 && " (Down Payment)"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Failed {payment.attemptCount || 1} time
                        {payment.attemptCount > 1 ? "s" : ""}
                      </p>
                      {payment.lastAttempt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last attempt:{" "}
                          {format(
                            new Date(payment.lastAttempt),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-red-200 text-red-900 border-red-400 font-bold">
                      Failed
                    </Badge>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => handlePayViaTerminal(payment)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay via Terminal
                    </Button>

                    <Button
                      size="sm"
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => handleSendReminder(payment)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>

                    {payment.paymentLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300"
                        asChild
                      >
                        <a
                          href={payment.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Link
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscriptionPayments.map((payment: any) => (
                <div
                  key={payment.paymentNumber}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    payment.status === "failed"
                      ? "bg-red-50 border-red-300"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      payment.status === "succeeded"
                        ? "bg-green-100"
                        : payment.status === "failed"
                        ? "bg-red-200"
                        : "bg-gray-100"
                    }`}
                  >
                    {payment.status === "succeeded" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : payment.status === "failed" ? (
                      <XCircle className="h-5 w-5 text-red-700" />
                    ) : (
                      <span className="text-sm font-medium text-gray-400">
                        {payment.paymentNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Payment #{payment.paymentNumber}
                      {payment.paymentNumber === 1 && " (Down Payment)"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.dueDate
                        ? format(new Date(payment.dueDate), "MMM dd, yyyy")
                        : "Date pending"}
                    </p>
                    {payment.status === "failed" && payment.attemptCount && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {payment.attemptCount} attempt
                        {payment.attemptCount > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      payment.status === "succeeded"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : payment.status === "failed"
                        ? "bg-red-200 text-red-900 border-red-400"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {payment.status === "succeeded"
                      ? "Paid"
                      : payment.status === "failed"
                      ? "Failed"
                      : "Pending"}
                  </Badge>
                </div>
              ))}

              {/* Visual Progress Dots */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <span className="text-sm text-gray-500 mr-2">Progress:</span>
                {Array(8)
                  .fill(null)
                  .map((_, index) => {
                    const payment = subscriptionPayments.find(
                      (p: any) => p.paymentNumber === index + 1
                    );
                    return (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          payment?.status === "succeeded"
                            ? "bg-green-500"
                            : payment?.status === "failed"
                            ? "bg-red-600"
                            : "bg-gray-300"
                        }`}
                        title={`Payment ${index + 1}: ${
                          payment?.status || "pending"
                        }`}
                      />
                    );
                  })}
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
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="text-red-900">Escalation Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {player.team && (
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => setShowEscalateModal(true)}
                >
                  <AlertOctagon className="h-4 w-4 mr-2" />
                  Escalate to Captain
                </Button>
              )}

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowSuspensionModal(true)}
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Consider Suspension
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <AlertOctagon className="mx-auto h-12 w-12 text-red-600 mb-3" />
                <p className="font-bold text-red-900 mb-1">Critical Risk</p>
                <p className="text-sm text-gray-500">
                  Immediate intervention required
                </p>
              </div>

              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Successful:</span>
                  <span className="font-medium text-green-600">
                    {completedPayments}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Failed:</span>
                  <span className="font-bold text-red-600">
                    {failedPayments.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending:</span>
                  <span className="font-medium text-gray-600">
                    {totalPayments - completedPayments - failedPayments.length}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="text-sm mb-2">
                  <span className="text-gray-500">Progress:</span>
                  <span className="font-medium ml-2">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                <p>Registered {daysSinceRegistration} days ago</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-500">Payment Type</p>
                <p className="font-medium">Installments (8 payments)</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Pricing Tier</p>
                <p className="font-medium">
                  {paymentMethod.pricingTier === "EARLY_BIRD"
                    ? "Early Bird"
                    : "Regular"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {selectedPayment && (
        <SendSpecificReminderModal
          open={showReminderModal}
          onOpenChange={setShowReminderModal}
          player={player}
          payment={selectedPayment}
          cityId={cityId}
        />
      )}

      {player.team && (
        <EscalateToCaptainModal
          open={showEscalateModal}
          onOpenChange={setShowEscalateModal}
          player={player}
          failedPaymentsCount={failedPayments.length}
          teamId={player.team._id}
          cityId={cityId}
        />
      )}

      <SuspensionWarningModal
        open={showSuspensionModal}
        onOpenChange={setShowSuspensionModal}
        player={player}
        failedPaymentsCount={failedPayments.length}
        cityId={cityId}
      />

      {selectedPayment && (
        <PayInstallmentTerminalModal
          open={showTerminalModal}
          onOpenChange={setShowTerminalModal}
          player={player}
          payment={selectedPayment}
          paymentMethod={paymentMethod}
          cityId={cityId}
        />
      )}
    </div>
  );
}
