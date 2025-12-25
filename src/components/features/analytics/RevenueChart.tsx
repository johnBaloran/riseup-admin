// src/components/features/analytics/RevenueChart.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Revenue over time chart display ONLY
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  dailyTrend: Array<{
    date: string;
    count: number;
    paid: number;
  }>;
  previousDailyTrend?: Array<{
    date: string;
    count: number;
    paid: number;
  }>;
  compareEnabled: boolean;
}

export function RevenueChart({
  dailyTrend,
  previousDailyTrend,
  compareEnabled,
}: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    // Parse the date string (YYYY-MM-DD) directly without timezone conversion
    // This treats it as a local date, not UTC
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data - merge current and previous trends
  const chartData = dailyTrend.map((current, index) => {
    const data: any = {
      date: current.date,
      displayDate: formatDate(current.date),
      currentRevenue: current.paid,
    };

    if (compareEnabled && previousDailyTrend && previousDailyTrend[index]) {
      data.previousRevenue = previousDailyTrend[index].paid;
      data.previousDate = formatDate(previousDailyTrend[index].date);
    }

    return data;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
        <p className="text-sm text-gray-600 mt-1">
          Daily revenue {compareEnabled ? "compared to previous period" : "trend"}
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "12px",
              }}
              formatter={(value: number, name: string, props: any) => {
                const formattedValue = formatCurrency(value);
                if (name === "Previous Period" && props.payload.previousDate) {
                  return [formattedValue, `${name} (${props.payload.previousDate})`];
                }
                return [formattedValue, name];
              }}
              labelStyle={{ color: "#111827", fontWeight: 600 }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="currentRevenue"
              name="Current Period"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", r: 4 }}
              activeDot={{ r: 6 }}
            />
            {compareEnabled && previousDailyTrend && (
              <Line
                type="monotone"
                dataKey="previousRevenue"
                name="Previous Period"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#9ca3af", r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
