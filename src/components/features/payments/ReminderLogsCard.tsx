// src/components/features/payments/ReminderLogsCard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display payment reminder history ONLY
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReminderLog {
  timestamp: Date;
  status: string;
  twilioSid?: string;
  errorMessage?: string;
  sentBy: string;
}

interface ReminderLogsCardProps {
  paymentStatus?: {
    reminderCount?: number;
    lastAttempt?: Date;
    reminderLogs?: ReminderLog[];
  };
}

export function ReminderLogsCard({ paymentStatus }: ReminderLogsCardProps) {
  const reminderCount = paymentStatus?.reminderCount || 0;
  const lastAttempt = paymentStatus?.lastAttempt;
  const logs = paymentStatus?.reminderLogs || [];

  // Calculate time until next reminder (48 hours from last attempt)
  const getNextReminderTime = () => {
    if (!lastAttempt) return "Available now";

    const lastAttemptTime = new Date(lastAttempt).getTime();
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const nextEligibleTime = lastAttemptTime + fortyEightHours;

    if (now >= nextEligibleTime) {
      return "Available now";
    }

    const hoursRemaining = Math.ceil((nextEligibleTime - now) / (60 * 60 * 1000));
    return `In ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
  };

  const getSentByLabel = (sentBy: string) => {
    if (sentBy === "cron") return "Automated Cron";
    return `Admin: ${sentBy}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Payment Reminder History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pb-4 border-b">
          <div>
            <p className="text-sm text-gray-500">Reminders Sent</p>
            <p className="text-2xl font-bold text-gray-900">
              {reminderCount}
              <span className="text-base font-normal text-gray-500">/10</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Reminder</p>
            <p className="text-sm font-medium text-gray-900">
              {lastAttempt
                ? formatDistanceToNow(new Date(lastAttempt), {
                    addSuffix: true,
                  })
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Eligible</p>
            <p className="text-sm font-medium text-gray-900">
              {reminderCount >= 10 ? "Limit reached" : getNextReminderTime()}
            </p>
          </div>
        </div>

        {/* Reminder Logs */}
        {logs.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Recent Activity:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs
                .slice()
                .reverse()
                .map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      log.status === "sent"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {log.status === "sent" ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${
                              log.status === "sent"
                                ? "text-green-900"
                                : "text-red-900"
                            }`}
                          >
                            {log.status === "sent"
                              ? "SMS Sent Successfully"
                              : "Failed to Send SMS"}
                          </p>
                          <p className="text-xs text-gray-500 flex-shrink-0">
                            {new Date(log.timestamp).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {getSentByLabel(log.sentBy)}
                        </p>
                        {log.twilioSid && (
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            SID: {log.twilioSid}
                          </p>
                        )}
                        {log.errorMessage && (
                          <p className="text-xs text-red-700 mt-1">
                            Error: {log.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              No reminders sent yet
            </p>
          </div>
        )}

        {/* Warning if approaching limit */}
        {reminderCount >= 8 && reminderCount < 10 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Approaching reminder limit ({reminderCount}/10). Player will
              stop receiving automated reminders after 10 attempts.
            </p>
          </div>
        )}

        {/* Limit reached warning */}
        {reminderCount >= 10 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              🚫 Reminder limit reached (10/10). This player will no longer
              receive automated reminders.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
