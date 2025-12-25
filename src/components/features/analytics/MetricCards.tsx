// src/components/features/analytics/MetricCards.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Top-level metric cards display ONLY
 */

"use client";

import { DollarSign, CreditCard, TrendingUp } from "lucide-react";

interface MetricCardsProps {
  stats: {
    totalCount: number;
    totalPaid: number;
  };
}

export function MetricCards({ stats }: MetricCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {formatCurrency(stats.totalPaid)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Amount collected
            </p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Payments */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {stats.totalCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Payment transactions
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Average Payment */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Payment</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(stats.totalCount > 0 ? stats.totalPaid / stats.totalCount : 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Per transaction
            </p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
