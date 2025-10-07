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

  // Ensure we always show 8 dots (1 down + 7 weekly)
  const allPayments = Array(8)
    .fill(null)
    .map((_, index) => {
      const payment = payments.find((p: any) => p.paymentNumber === index + 1);
      return {
        paymentNumber: index + 1,
        status: payment?.status || "pending",
      };
    });

  return (
    <div className="flex items-center gap-1">
      {allPayments.map((payment) => (
        <div
          key={payment.paymentNumber}
          className={`${dotSize[size]} rounded-full ${getStatusColor(
            payment.status
          )} transition-colors`}
          title={`Payment ${payment.paymentNumber}: ${payment.status}`}
        />
      ))}
    </div>
  );
}