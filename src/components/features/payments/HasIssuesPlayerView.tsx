// src/components/features/payments/HasIssuesPlayerView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Has issues installment player detail view ONLY
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
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
} from "lucide-react";
import { format } from "date-fns";
import { SendSpecificReminderModal } from "./SendSpecificReminderModal";
import { NotifyCaptainModal } from "./NotifyCaptainModal";

interface HasIssuesPlayerViewProps {
  player: any;
  paymentMethod: any;
  cityId: string;
}

export function HasIssuesPlayerView({ player, paymentMethod, cityId }: HasIssuesPlayerViewProps) {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCaptainModal, setShowCaptainModal] = useState(false);

  const subscriptionPayments = paymentMethod.installments?.subscriptionPayments || [];
  const completedPayments = subscriptionPayments.filter((p: any) => p.status === "succeeded").length;
  const failedPayments = subscriptionPayments.filter((p: any) => p.status === "failed");
  const totalPayments = 8;
  const progressPercentage = Math.round((completedPayments / totalPayments) * 100);

  const handleSendReminder = (payment: any) => {
    setSelectedPayment(payment);
    setShowReminderModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/${cityId}/payments`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Link>
        </Button>
      </div>

      {/* Player Overview */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{player.playerName}</h1>
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Has Issues
          </Badge>
        </div>
        <p className="text-gray-600">
          {player.team?.teamName || "No Team"} • {player.division?.divisionName}
        </p>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-900">Payment Issues Detected</p>
          <p className="text-sm text-yellow-700 mt-1">
            {failedPayments.length} payment{failedPayments.length > 1 ? "s" : ""} failed. 
            Commissioner follow-up recommended.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Failed Payments Alert */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">Failed Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {failedPayments.map((payment: any) => (
                <div
                  key={payment.paymentNumber}
                  className="bg-white border border-red-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-red-900">
                        Payment #{payment.paymentNumber}
                        {payment.paymentNumber === 1 && " (Down Payment)"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Failed {payment.attemptCount || 1} time{payment.attemptCount > 1 ? "s" : ""}
                      </p>
                      {payment.lastAttempt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last attempt: {format(new Date(payment.lastAttempt), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Failed
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSendReminder(payment)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                    {payment.paymentLink && (
                     <Button size="sm" variant="outline" asChild>
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
                    payment.status === "failed" ? "bg-red-50 border-red-200" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      payment.status === "succeeded"
                        ? "bg-green-100"
                        : payment.status === "failed"
                        ? "bg-red-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {payment.status === "succeeded" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : payment.status === "failed" ? (
                      <XCircle className="h-5 w-5 text-red-600" />
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
                      <p className="text-xs text-red-600 mt-1">
                        {payment.attemptCount} attempt{payment.attemptCount > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      payment.status === "succeeded"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : payment.status === "failed"
                        ? "bg-red-100 text-red-800 border-red-200"
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
                            ? "bg-red-500"
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
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
                <p className="font-medium text-yellow-900 mb-1">Needs Attention</p>
                <p className="text-sm text-gray-500">
                  Follow up recommended
                </p>
              </div>

              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Successful:</span>
                  <span className="font-medium text-green-600">{completedPayments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Failed:</span>
                  <span className="font-medium text-red-600">{failedPayments.length}</span>
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
                  <span className="font-medium ml-2">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
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