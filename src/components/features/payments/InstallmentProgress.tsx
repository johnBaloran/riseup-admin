// src/components/features/payments/InstallmentProgress.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Installment payment progress visualization ONLY
 */

"use client";

export function InstallmentProgress({
  payments,
  size = "md",
}: {
  payments: any[];
  size?: "sm" | "md" | "lg";
}) {
  const dotSize = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  let allPayments;
  if (payments) {
    // Always show 8 dots, map by array index instead of paymentNumber
    allPayments = Array(8)
      .fill(null)
      .map((_, index) => {
        const payment = payments[index]; // take the payment directly by array order
        return {
          paymentNumber: index + 1,
          status: payment?.status || "pending",
        };
      });
  }

  return (
    <div className="flex items-center gap-1">
      {allPayments &&
        allPayments.map((payment, index) => (
          <div
            key={index}
            className={`${dotSize[size]} rounded-full ${getStatusColor(
              payment.status
            )} transition-colors`}
            title={`Payment ${payment.paymentNumber}: ${
              index === 0 ? `${payment.status} (Down Payment)` : payment.status
            }`}
          />
        ))}
    </div>
  );
}
