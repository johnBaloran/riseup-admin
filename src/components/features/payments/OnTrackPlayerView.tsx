// src/components/features/payments/OnTrackPlayerView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * On-track installment player detail view ONLY
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  Mail,
  Phone,
  Instagram as InstagramIcon,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

interface OnTrackPlayerViewProps {
  player: any;
  paymentMethod: any;
  cityId: string;
}

export function OnTrackPlayerView({ player, paymentMethod, cityId }: OnTrackPlayerViewProps) {
  const subscriptionPayments = paymentMethod.installments?.subscriptionPayments || [];
  const completedPayments = subscriptionPayments.filter((p: any) => p.status === "succeeded").length;
  const totalPayments = 8; // 1 down + 7 weekly
  const progressPercentage = Math.round((completedPayments / totalPayments) * 100);
  
  const nextPayment = subscriptionPayments.find((p: any) => p.status === "pending");

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
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            On Track
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
          <p className="font-medium text-green-900">Payment Plan Active</p>
          <p className="text-sm text-green-700 mt-1">
            All payments made on time. {completedPayments} of {totalPayments} payments completed ({progressPercentage}%).
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Payment Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    {completedPayments} of {totalPayments} payments completed
                  </span>
                  <span className="text-gray-500">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Next Payment */}
              {nextPayment && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Next Payment Due
                  </p>
                  <p className="text-sm text-blue-700">
                    {nextPayment.dueDate
                      ? format(new Date(nextPayment.dueDate), "MMMM dd, yyyy")
                      : "Date pending"}
                  </p>
                </div>
              )}

              {/* Payment Timeline */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Payment Timeline</p>
                {subscriptionPayments.map((payment: any) => (
                  <div
                    key={payment.paymentNumber}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                      {payment.status === "succeeded" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
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
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {payment.status === "succeeded" ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Visual Progress Dots */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <span className="text-sm text-gray-500 mr-2">Progress:</span>
                {Array(8)
                  .fill(null)
                  .map((_, index) => {
                    const payment = subscriptionPayments.find(
                      (p: any) => p.paymentNumber === index + 1
                    );
                    const isCompleted = payment?.status === "succeeded";
                    return (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={`Payment ${index + 1}: ${
                          isCompleted ? "Succeeded" : "Pending"
                        }`}
                      />
                    );
                  })}
              </div>
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
                  <p className="font-medium">{player.team?.teamName || "No Team Assigned"}</p>
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
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <TrendingUp className="mx-auto h-12 w-12 text-green-500 mb-3" />
                <p className="font-medium text-green-900 mb-1">On Track</p>
                <p className="text-sm text-gray-500">
                  No commissioner action needed
                </p>
              </div>

              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Successful:</span>
                  <span className="font-medium text-green-600">{completedPayments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending:</span>
                  <span className="font-medium text-gray-600">
                    {totalPayments - completedPayments}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Failed:</span>
                  <span className="font-medium text-gray-600">0</span>
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
    </div>
  );
}