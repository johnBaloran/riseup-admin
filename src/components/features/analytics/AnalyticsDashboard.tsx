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
import { MetricCards } from "./MetricCards";
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

  const getActiveDateRange = () => {
    if (!currentFilters.startDate || !currentFilters.endDate) return "today";

    const start = new Date(currentFilters.startDate);
    const end = new Date(currentFilters.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 7) return "7days";
    if (diffDays === 28) return "28days";
    if (diffDays === 60) return "60days";
    if (diffDays === 90) return "90days";
    return "custom";
  };

  const activeDateRange = getActiveDateRange();

  const handleDateRangeClick = (range: string) => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    let startDate = new Date();

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7days") {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "28days") {
      startDate.setDate(startDate.getDate() - 28);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "60days") {
      startDate.setDate(startDate.getDate() - 60);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "90days") {
      startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
    }

    updateFilters({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  };

  const handleCustomDateRange = () => {
    if (customStartDate && customEndDate) {
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
                {analytics.stats.linkage.withUser} with user accounts (
                {analytics.stats.linkage.linkageRate.toFixed(1)}%)
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
                variant={activeDateRange === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateRangeClick("today")}
              >
                Today
              </Button>
              <Button
                variant={activeDateRange === "7days" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateRangeClick("7days")}
              >
                7 Days
              </Button>
              <Button
                variant={activeDateRange === "28days" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateRangeClick("28days")}
              >
                28 Days
              </Button>
              <Button
                variant={activeDateRange === "60days" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateRangeClick("60days")}
              >
                60 Days
              </Button>
              <Button
                variant={activeDateRange === "90days" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateRangeClick("90days")}
              >
                90 Days
              </Button>

              {/* Custom Date Range Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={activeDateRange === "custom" ? "default" : "outline"}
                    size="sm"
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
        </div>
      </div>

      {/* Metric Cards */}
      <MetricCards stats={analytics.stats} />

      {/* Payment Type Breakdown */}
      <PaymentTypeBreakdown stats={analytics.stats} />

      {/* City Breakdown */}
      {analytics.citiesBreakdown.length > 1 && (
        <CityBreakdown cities={analytics.citiesBreakdown} />
      )}

      {/* Payment Method List */}
      <PaymentMethodList paymentMethods={analytics.paymentMethods} />
    </div>
  );
}
