// src/components/features/payments/IssuesPlayerView.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Unified view for players with payment issues (has-issues and critical) ONLY
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  AlertOctagon,
  Mail,
  Phone,
  Instagram as InstagramIcon,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageSquare,
  CreditCard,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { SendSpecificReminderModal } from "./SendSpecificReminderModal";
import { NotifyCaptainModal } from "./NotifyCaptainModal";
import { ChargeCardModal } from "./ChargeCardModal";
import { SendPaymentLinkModal } from "./SendPaymentLinkModal";
import { PayInstallmentTerminalModal } from "./PayInstallmentTerminalModal";
import { EscalateToCaptainModal } from "./EscalateToCaptainModal";
import { SuspensionWarningModal } from "./SuspensionWarningModal";

interface IssuesPlayerViewProps {
  player: any;
  paymentMethod: any;
  cityId: string;
  severity: "has-issues" | "critical";
}

export function IssuesPlayerView({
  player,
  paymentMethod,
  cityId,
  severity,
}: IssuesPlayerViewProps) {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCaptainModal, setShowCaptainModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [loadingCard, setLoadingCard] = useState(true);

  const isCritical = severity === "critical";

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

  const handleChargeCard = (payment: any) => {
    setSelectedPayment(payment);
    setShowChargeModal(true);
  };

  const handleSendPaymentLink = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentLinkModal(true);
  };

  const handlePayViaTerminal = (payment: any) => {
    setSelectedPayment(payment);
    setShowTerminalModal(true);
  };

  // Load card info on mount (only for has-issues)
  useEffect(() => {
    if (isCritical) {
      setLoadingCard(false);
      return;
    }

    const loadCardInfo = async () => {
      if (!player.customerId) {
        setLoadingCard(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/v1/payments/card-info/${player.customerId}`
        );

        if (response.ok) {
          const data = await response.json();
          setCardInfo(data.data);
        }
      } catch (error) {
        console.error("Error loading card info:", error);
      } finally {
        setLoadingCard(false);
      }
    };

    loadCardInfo();
  }, [player.customerId, isCritical]);

  const getCardDisplay = () => {
    if (isCritical) return null;

    if (loadingCard) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CreditCard className="h-4 w-4 animate-pulse" />
          <span>Loading card info...</span>
        </div>
      );
    }

    if (!cardInfo?.hasCard) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CreditCard className="h-4 w-4" />
          <span>No card on file</span>
        </div>
      );
    }

    const brandDisplay =
      cardInfo.brand.charAt(0).toUpperCase() + cardInfo.brand.slice(1);

    return (
      <div className="flex items-center gap-2 text-sm">
        <CreditCard className="h-4 w-4 text-gray-400" />
        <span
          className={cardInfo.isValid ? "text-gray-900" : "text-orange-600"}
        >
          {brandDisplay} ****{cardInfo.last4}
        </span>
        <span className="text-gray-500">
          (Exp: {cardInfo.expMonth}/{cardInfo.expYear})
        </span>
        {cardInfo.isValid ? (
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            ✓ Valid
          </Badge>
        ) : (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
            ⚠️ Expired
          </Badge>
        )}
      </div>
    );
  };

  // Dynamic styling based on severity
  const alertStyles = isCritical
    ? {
        container: "bg-red-50 border-2 border-red-300",
        icon: "h-6 w-6 text-red-600",
        title: "font-bold text-red-900",
        description: "text-sm text-red-700",
      }
    : {
        container: "bg-yellow-50 border border-yellow-200",
        icon: "h-5 w-5 text-yellow-600",
        title: "font-medium text-yellow-900",
        description: "text-sm text-yellow-700",
      };

  const badgeStyles = isCritical
    ? "bg-red-100 text-red-800 border-red-200"
    : "bg-yellow-100 text-yellow-800 border-yellow-200";

  const cardStyles = isCritical
    ? "border-red-300 bg-red-50"
    : "border-yellow-200 bg-yellow-50";

  const progressColor = isCritical ? "bg-red-600" : "bg-yellow-500";

  const AlertIcon = isCritical ? AlertOctagon : AlertTriangle;

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
          <Badge className={badgeStyles}>
            <AlertIcon className="h-3 w-3 mr-1" />
            {isCritical ? "Critical" : "Has Issues"}
          </Badge>
        </div>
        <p className="text-gray-600">
          {player.team?.teamName || "No Team"} • {player.division?.divisionName}
        </p>
        {!isCritical && <div className="mt-2">{getCardDisplay()}</div>}
      </div>

      {/* Alert Message */}
      <div className={`${alertStyles.container} rounded-lg p-4 flex items-start gap-3`}>
        <AlertIcon className={`${alertStyles.icon} flex-shrink-0 mt-0.5`} />
        <div>
          <p className={alertStyles.title}>
            {isCritical ? "Immediate Action Required" : "Payment Issues Detected"}
          </p>
          <p className={alertStyles.description}>
            {failedPayments.length} payment{failedPayments.length > 1 ? "s" : ""}{" "}
            failed.{" "}
            {isCritical
              ? `Registered ${daysSinceRegistration} days ago. Escalation or suspension consideration needed.`
              : "Commissioner follow-up recommended."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Failed Payments */}
          <Card className={cardStyles}>
            <CardHeader>
              <CardTitle className={isCritical ? "text-red-900" : "text-yellow-900"}>
                {isCritical
                  ? `Critical Payment Failures (${failedPayments.length})`
                  : "Failed Payments"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {failedPayments.map((payment: any) => {
                const amount =
                  payment.paymentNumber === 1
                    ? 60
                    : paymentMethod.pricingTier === "EARLY_BIRD"
                    ? 25
                    : 30;

                return (
                  <div
                    key={payment.paymentNumber}
                    className={`bg-white rounded-lg p-4 ${
                      isCritical ? "border-2 border-red-300" : "border border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p
                          className={`${
                            isCritical ? "font-bold" : "font-medium"
                          } text-red-900`}
                        >
                          Payment #{payment.paymentNumber}
                          {payment.paymentNumber === 1 && " (Down Payment)"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {!isCritical && `Amount: $${amount} • `}
                          Failed {payment.attemptCount || 1} time
                          {payment.attemptCount > 1 ? "s" : ""}
                        </p>
                        {payment.lastAttempt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last attempt:{" "}
                            {format(new Date(payment.lastAttempt), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={
                          isCritical
                            ? "bg-red-200 text-red-900 border-red-400 font-bold"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        Failed
                      </Badge>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {!isCritical && cardInfo?.isValid && (
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleChargeCard(payment)}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Charge Card Now
                        </Button>
                      )}

                      <Button
                        size="sm"
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => handlePayViaTerminal(payment)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay via Terminal
                      </Button>

                      {!isCritical && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleSendPaymentLink(payment)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Payment Link
                        </Button>
                      )}

                      {isCritical && (
                        <Button
                          size="sm"
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                          onClick={() => handleSendReminder(payment)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Reminder
                        </Button>
                      )}

                      {payment.paymentLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          className={isCritical ? "border-red-300" : ""}
                          asChild
                        >
                          <a
                            href={payment.paymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Payment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscriptionPayments.map((payment: any, index: number) => (
                <div
                  key={payment.paymentNumber || index + 1}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    payment.status === "failed"
                      ? isCritical
                        ? "bg-red-50 border-red-300"
                        : "bg-red-50 border-red-200"
                      : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      payment.status === "succeeded"
                        ? "bg-green-100"
                        : payment.status === "failed"
                        ? isCritical
                          ? "bg-red-200"
                          : "bg-red-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {payment.status === "succeeded" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : payment.status === "failed" ? (
                      <XCircle
                        className={`h-5 w-5 ${
                          isCritical ? "text-red-700" : "text-red-600"
                        }`}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-400">
                        {payment.paymentNumber || index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Payment #{payment.paymentNumber || index + 1}
                      {(payment.paymentNumber === 1 || index === 0) &&
                        " (Down Payment)"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.dueDate
                        ? format(new Date(payment.dueDate), "MMM dd, yyyy")
                        : "Date pending"}
                    </p>
                    {payment.status === "failed" && payment.attemptCount && (
                      <p
                        className={`text-xs mt-1 ${
                          isCritical
                            ? "text-red-600 font-medium"
                            : "text-red-600"
                        }`}
                      >
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
                        ? isCritical
                          ? "bg-red-200 text-red-900 border-red-400"
                          : "bg-red-100 text-red-800 border-red-200"
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
                    const payment = subscriptionPayments[index];
                    return (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          payment?.status === "succeeded"
                            ? "bg-green-500"
                            : payment?.status === "failed"
                            ? isCritical
                              ? "bg-red-600"
                              : "bg-red-500"
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
          {isCritical ? (
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
          ) : (
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
          )}

          <Card>
            <CardHeader>
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <AlertIcon
                  className={`mx-auto h-12 w-12 mb-3 ${
                    isCritical ? "text-red-600" : "text-yellow-500"
                  }`}
                />
                <p
                  className={`mb-1 ${
                    isCritical
                      ? "font-bold text-red-900"
                      : "font-medium text-yellow-900"
                  }`}
                >
                  {isCritical ? "Critical Risk" : "Needs Attention"}
                </p>
                <p className="text-sm text-gray-500">
                  {isCritical
                    ? "Immediate intervention required"
                    : "Follow up recommended"}
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
                  <span
                    className={`${
                      isCritical ? "font-bold" : "font-medium"
                    } text-red-600`}
                  >
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
                    className={`${progressColor} h-2 rounded-full transition-all`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {isCritical && (
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  <p>Registered {daysSinceRegistration} days ago</p>
                </div>
              )}
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
      {selectedPayment && !isCritical && cardInfo?.isValid && (
        <ChargeCardModal
          open={showChargeModal}
          onOpenChange={setShowChargeModal}
          player={player}
          payment={selectedPayment}
          cardInfo={cardInfo}
          paymentMethod={paymentMethod}
          cityId={cityId}
        />
      )}

      {selectedPayment && !isCritical && (
        <SendPaymentLinkModal
          open={showPaymentLinkModal}
          onOpenChange={setShowPaymentLinkModal}
          player={player}
          payment={selectedPayment}
          paymentMethod={paymentMethod}
          cityId={cityId}
        />
      )}

      {selectedPayment && (
        <SendSpecificReminderModal
          open={showReminderModal}
          onOpenChange={setShowReminderModal}
          player={player}
          payment={selectedPayment}
          cityId={cityId}
        />
      )}

      {player.team && !isCritical && (
        <NotifyCaptainModal
          open={showCaptainModal}
          onOpenChange={setShowCaptainModal}
          player={player}
          teamId={player.team._id}
        />
      )}

      {player.team && isCritical && (
        <EscalateToCaptainModal
          open={showEscalateModal}
          onOpenChange={setShowEscalateModal}
          player={player}
          failedPaymentsCount={failedPayments.length}
          teamId={player.team._id}
          cityId={cityId}
        />
      )}

      {isCritical && (
        <SuspensionWarningModal
          open={showSuspensionModal}
          onOpenChange={setShowSuspensionModal}
          player={player}
          failedPaymentsCount={failedPayments.length}
          cityId={cityId}
        />
      )}

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
