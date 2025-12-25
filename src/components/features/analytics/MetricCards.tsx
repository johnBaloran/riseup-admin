// src/components/features/analytics/MetricCards.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Top-level metric cards display ONLY
 */

"use client";

import { DollarSign, CreditCard, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardsProps {
  stats: {
    totalCount: number;
    totalPaid: number;
  };
  previousStats?: {
    totalCount: number;
    totalPaid: number;
  };
  compareEnabled: boolean;
}

export function MetricCards({ stats, previousStats, compareEnabled }: MetricCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const renderComparison = (current: number, previous: number, isCurrency: boolean = false) => {
    if (!compareEnabled || !previousStats) return null;

    const percentChange = calculatePercentageChange(current, previous);
    const isPositive = percentChange >= 0;
    const Arrow = isPositive ? ArrowUp : ArrowDown;

    return (
      <div className="mt-2 space-y-1">
        <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <Arrow className="h-4 w-4 mr-1" />
          <span className="font-medium">{Math.abs(percentChange).toFixed(1)}%</span>
          <span className="text-gray-500 ml-1">vs previous period</span>
        </div>
        <p className="text-xs text-gray-500">
          Previous: {isCurrency ? formatCurrency(previous) : previous.toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-green-900">
          {formatCurrency(stats.totalPaid)}
        </p>
        {renderComparison(stats.totalPaid, previousStats?.totalPaid || 0, true)}
      </div>

      {/* Total Payments */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Payments</p>
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {stats.totalCount}
        </p>
        {renderComparison(stats.totalCount, previousStats?.totalCount || 0, false)}
      </div>

      {/* Average Payment */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Average Payment</p>
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.totalCount > 0 ? stats.totalPaid / stats.totalCount : 0)}
        </p>
        {renderComparison(
          stats.totalCount > 0 ? stats.totalPaid / stats.totalCount : 0,
          previousStats && previousStats.totalCount > 0
            ? previousStats.totalPaid / previousStats.totalCount
            : 0,
          true
        )}
      </div>
    </div>
  );
}
