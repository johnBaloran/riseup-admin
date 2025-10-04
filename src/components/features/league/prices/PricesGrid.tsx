// src/components/features/league/prices/PricesGrid.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display prices in responsive card grid ONLY
 */

"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Tag } from "lucide-react";

interface Price {
  _id: string;
  name: string;
  priceId: string;
  amount: number;
  type:
    | "earlyBird"
    | "regular"
    | "installment"
    | "regularInstallment"
    | "firstInstallment"
    | "free";
}

interface PricesGridProps {
  prices: Price[];
}

export function PricesGrid({ prices }: PricesGridProps) {
  const groupedPrices = useMemo(() => {
    return {
      earlyBird: prices.filter((p) => p.type === "earlyBird"),
      regular: prices.filter((p) => p.type === "regular"),
      installment: prices.filter((p) => p.type === "installment"),
      regularInstallment: prices.filter((p) => p.type === "regularInstallment"),
      firstInstallment: prices.filter((p) => p.type === "firstInstallment"),
      free: prices.filter((p) => p.type === "free"),
    };
  }, [prices]);

  const getTypeBadge = (type: string) => {
    const badges = {
      earlyBird: {
        label: "Early Bird",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      regular: {
        label: "Regular",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      installment: {
        label: "Installment (EB)",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      regularInstallment: {
        label: "Installment (Reg)",
        className: "bg-orange-100 text-orange-800 border-orange-200",
      },
      firstInstallment: {
        label: "Down Payment",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      free: {
        label: "Free",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
    };
    return badges[type as keyof typeof badges] || badges.regular;
  };

  if (prices.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No prices yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating your first price from your Stripe account.
        </p>
      </div>
    );
  }

  const renderPriceSection = (title: string, prices: Price[]) => {
    if (prices.length === 0) return null;

    return (
      <div key={title} className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prices.map((price) => {
            const badge = getTypeBadge(price.type);
            return (
              <Card key={price._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{price.name}</CardTitle>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${price.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {price.priceId}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderPriceSection("Single Payment", [
        ...groupedPrices.earlyBird,
        ...groupedPrices.regular,
      ])}
      {renderPriceSection("Installment Payments", [
        ...groupedPrices.firstInstallment,
        ...groupedPrices.installment,
        ...groupedPrices.regularInstallment,
      ])}
      {renderPriceSection("Free", groupedPrices.free)}
    </div>
  );
}
