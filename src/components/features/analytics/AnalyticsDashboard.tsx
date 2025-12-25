// src/components/features/analytics/AnalyticsDashboard.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Analytics dashboard orchestration with filters ONLY
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { MetricCards } from "./MetricCards";
import { RevenueChart } from "./RevenueChart";
import { PaymentTypeBreakdown } from "./PaymentTypeBreakdown";
import { CityBreakdown } from "./CityBreakdown";
import { PaymentMethodList } from "./PaymentMethodList";
import { PaymentAnalytics } from "@/lib/db/queries/analytics";

interface AnalyticsDashboardProps {
  analytics: PaymentAnalytics;
  cities: Array<{ _id: string; cityName: string }>;
  currentFilters: {
    cityId?: string;
    startDate?: string;
    endDate?: string;
    compareEnabled?: boolean;
  };
}

export function AnalyticsDashboard({
  analytics,
  cities,
  currentFilters,
}: AnalyticsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Initialize activeDateRange from URL params
  const getInitialDateRange = () => {
    if (!currentFilters.startDate || !currentFilters.endDate) return "today";

    const start = new Date(currentFilters.startDate + "T00:00:00");
    const end = new Date(currentFilters.endDate + "T00:00:00");
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 6) return "7days";
    if (diffDays === 27) return "28days";
    if (diffDays === 59) return "60days";
    if (diffDays === 89) return "90days";
    return "custom";
  };

  const [activeDateRange, setActiveDateRange] = useState(getInitialDateRange());

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/dashboard?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(`/dashboard`);
  };

  const hasActiveFilters = currentFilters.cityId;

  // Helper to get EST date string (YYYY-MM-DD)
  const getESTDateString = (date: Date) => {
    // Use toLocaleString to get proper EST date
    const estString = date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // Convert from MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = estString.split("/");
    return `${year}-${month}-${day}`;
  };

  // Get current date/time in EST
  const getESTDate = () => {
    const now = new Date();
    // Get EST date string and create new Date object
    const estString = now.toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    return new Date(estString);
  };

  const handleDateRangeClick = (range: string) => {
    setActiveDateRange(range);

    // Get current EST date
    const now = getESTDate();
    let startDate = new Date(now);
    const endDate = new Date(now);

    console.log("DEBUG - handleDateRangeClick:", {
      range,
      now,
      estDateString: getESTDateString(now),
      nowISO: now.toISOString(),
    });

    if (range === "today") {
      // Today only in EST
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "7days") {
      // Last 7 days including today
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "28days") {
      // Last 28 days including today
      startDate.setDate(startDate.getDate() - 27);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "60days") {
      // Last 60 days including today
      startDate.setDate(startDate.getDate() - 59);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "90days") {
      // Last 90 days including today
      startDate.setDate(startDate.getDate() - 89);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    updateFilters({
      startDate: getESTDateString(startDate),
      endDate: getESTDateString(endDate),
    });
  };

  const handleCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setActiveDateRange("custom");
      updateFilters({
        startDate: customStartDate,
        endDate: customEndDate,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Overview
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {analytics.stats.totalCount} total payments •{" "}
                {analytics.citiesBreakdown.length} cities •{" "}
              </p>
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              City
            </label>
            <Select
              value={currentFilters.cityId || "all"}
              onValueChange={(value) => {
                updateFilters({
                  city: value === "all" ? undefined : value,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city._id} value={city._id}>
                    {city.cityName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Buttons */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Date Range
            </label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangeClick("today")}
                style={activeDateRange === "today" ? { backgroundColor: "#111827", color: "white", borderColor: "#111827" } : {}}
                className={activeDateRange === "today" ? "hover:!bg-gray-800" : ""}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangeClick("7days")}
                style={activeDateRange === "7days" ? { backgroundColor: "#111827", color: "white", borderColor: "#111827" } : {}}
                className={activeDateRange === "7days" ? "hover:!bg-gray-800" : ""}
              >
                7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangeClick("28days")}
                style={activeDateRange === "28days" ? { backgroundColor: "#111827", color: "white", borderColor: "#111827" } : {}}
                className={activeDateRange === "28days" ? "hover:!bg-gray-800" : ""}
              >
                28 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangeClick("60days")}
                style={activeDateRange === "60days" ? { backgroundColor: "#111827", color: "white", borderColor: "#111827" } : {}}
                className={activeDateRange === "60days" ? "hover:!bg-gray-800" : ""}
              >
                60 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangeClick("90days")}
                style={activeDateRange === "90days" ? { backgroundColor: "#111827", color: "white", borderColor: "#111827" } : {}}
                className={activeDateRange === "90days" ? "hover:!bg-gray-800" : ""}
              >
                90 Days
              </Button>

              {/* Custom Date Range Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    style={activeDateRange === "custom" ? { backgroundColor: "#111827", color: "white", borderColor: "#111827" } : {}}
                    className={activeDateRange === "custom" ? "hover:!bg-gray-800" : ""}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Custom
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleCustomDateRange}
                      disabled={!customStartDate || !customEndDate}
                      className="w-full"
                    >
                      Apply Date Range
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Comparison Toggle */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="compare"
              checked={currentFilters.compareEnabled || false}
              onCheckedChange={(checked) => {
                updateFilters({
                  compare: checked ? "true" : undefined,
                });
              }}
            />
            <label
              htmlFor="compare"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Compare to previous period
            </label>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <MetricCards
        stats={analytics.stats}
        previousStats={analytics.previousStats}
        compareEnabled={currentFilters.compareEnabled || false}
      />

      {/* Revenue Chart */}
      <RevenueChart
        dailyTrend={analytics.dailyTrend}
        previousDailyTrend={analytics.previousDailyTrend}
        compareEnabled={currentFilters.compareEnabled || false}
      />

      {/* Payment Type Breakdown */}
      <PaymentTypeBreakdown stats={analytics.stats} />

      {/* City Breakdown */}
      {analytics.citiesBreakdown.length > 1 && (
        <CityBreakdown
          cities={analytics.citiesBreakdown}
          previousCities={analytics.previousCitiesBreakdown}
          compareEnabled={currentFilters.compareEnabled || false}
        />
      )}

      {/* Payment Method List */}
      <PaymentMethodList paymentMethods={analytics.paymentMethods} />
    </div>
  );
}
