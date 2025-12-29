// src/components/features/analytics/PaymentMethodList.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Payment methods list table display ONLY
 */

"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, User, Building2, CreditCard, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PaymentMethodListProps {
  paymentMethods: any[];
}

export function PaymentMethodList({ paymentMethods }: PaymentMethodListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 20;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Pagination
  const totalPages = Math.ceil(paymentMethods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = paymentMethods.slice(startIndex, endIndex);

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "FULL_PAYMENT":
        return "bg-blue-100 text-blue-800";
      case "INSTALLMENTS":
        return "bg-purple-100 text-purple-800";
      case "CASH":
        return "bg-green-100 text-green-800";
      case "TERMINAL":
        return "bg-orange-100 text-orange-800";
      case "E_TRANSFER":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "FULL_PAYMENT":
        return "Full Payment";
      case "INSTALLMENTS":
        return "Installments";
      case "CASH":
        return "Cash";
      case "TERMINAL":
        return "Terminal";
      case "E_TRANSFER":
        return "E-Transfer";
      default:
        return type;
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // CSV Headers
      const headers = [
        "Date",
        "Player Name",
        "Team",
        "User Name",
        "User Email",
        "Division",
        "City",
        "Payment Type",
        "Amount Paid",
        "Status",
        "Pricing Tier",
      ];

      // CSV Rows
      const rows = paymentMethods.map((pm) => [
        formatDate(pm.createdAt),
        pm.player?.playerName || "N/A",
        pm.player?.team?.teamName || "N/A",
        pm.player?.user?.name || "N/A",
        pm.player?.user?.email || "N/A",
        pm.division?.divisionName || "N/A",
        pm.division?.city?.cityName || "N/A",
        getPaymentTypeLabel(pm.paymentType),
        pm.amountPaid || 0,
        pm.status,
        pm.pricingTier === "EARLY_BIRD" ? "Early Bird" : "Regular",
      ]);

      // Build CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payment-methods-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Methods
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {paymentMethods.length} total payments •{" "}
              Showing {startIndex + 1}-{Math.min(endIndex, paymentMethods.length)}
            </p>
          </div>
          <Button
            onClick={exportToCSV}
            disabled={isExporting || paymentMethods.length === 0}
            variant="outline"
          >
            {isExporting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Division / City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPayments.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No payment methods found for the selected filters.
                </td>
              </tr>
            ) : (
              currentPayments.map((pm) => {
                const hasUser = !!pm.player?.user;
                const isStripeMethod = ["FULL_PAYMENT", "INSTALLMENTS"].includes(
                  pm.paymentType
                );

                return (
                  <tr key={pm._id} className="hover:bg-gray-50">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(pm.createdAt)}
                    </td>

                    {/* Player */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pm.player?.playerName || "N/A"}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pm.player?.team?.teamName || "N/A"}
                      </div>
                    </td>

                    {/* User Account */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasUser ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {pm.player.user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {pm.player.user.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">
                            {isStripeMethod ? "Missing ⚠️" : "No Account"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Division / City */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {pm.division?.divisionName || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {pm.division?.city?.cityName || "N/A"}
                      </div>
                    </td>

                    {/* Payment Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentTypeColor(
                          pm.paymentType
                        )}`}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        {getPaymentTypeLabel(pm.paymentType)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-green-900">
                        {formatCurrency(pm.amountPaid)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(pm.status)}
                    </td>

                    {/* Tier */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-600">
                        {pm.pricingTier === "EARLY_BIRD" ? "Early Bird" : "Regular"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, paymentMethods.length)} of{" "}
            {paymentMethods.length} results
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis
                  const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                  return (
                    <div key={page} className="flex items-center gap-2">
                      {showEllipsisBefore && (
                        <span className="text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
