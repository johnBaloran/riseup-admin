// src/components/features/analytics/PaymentTypeBreakdown.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Payment type breakdown table display ONLY
 */

"use client";

interface PaymentTypeBreakdownProps {
  stats: {
    byPaymentType: {
      FULL_PAYMENT: {
        count: number;
        paid: number;
        withUser: number;
      };
      INSTALLMENTS: {
        count: number;
        paid: number;
        withUser: number;
      };
      CASH: { count: number; paid: number; withUser: number };
      TERMINAL: {
        count: number;
        paid: number;
        withUser: number;
      };
      E_TRANSFER: {
        count: number;
        paid: number;
        withUser: number;
      };
    };
    byPricingTier: {
      EARLY_BIRD: { count: number; paid: number };
      REGULAR: { count: number; paid: number };
    };
    byStatus: {
      PENDING: { count: number; amount: number };
      IN_PROGRESS: { count: number; amount: number };
      COMPLETED: { count: number; amount: number };
    };
    linkage: {
      withUser: number;
      withoutUser: number;
      linkageRate: number;
    };
  };
}

export function PaymentTypeBreakdown({ stats }: PaymentTypeBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const paymentTypes = [
    {
      label: "Full Payment (Stripe)",
      key: "FULL_PAYMENT",
      data: stats.byPaymentType.FULL_PAYMENT,
      color: "blue",
    },
    {
      label: "Installments (Stripe)",
      key: "INSTALLMENTS",
      data: stats.byPaymentType.INSTALLMENTS,
      color: "purple",
    },
    {
      label: "Cash",
      key: "CASH",
      data: stats.byPaymentType.CASH,
      color: "green",
    },
    {
      label: "Terminal",
      key: "TERMINAL",
      data: stats.byPaymentType.TERMINAL,
      color: "orange",
    },
    {
      label: "E-Transfer",
      key: "E_TRANSFER",
      data: stats.byPaymentType.E_TRANSFER,
      color: "pink",
    },
  ];

  const totalCount =
    stats.byPaymentType.FULL_PAYMENT.count +
    stats.byPaymentType.INSTALLMENTS.count +
    stats.byPaymentType.CASH.count +
    stats.byPaymentType.TERMINAL.count +
    stats.byPaymentType.E_TRANSFER.count;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Payment Method Breakdown
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Revenue and linkage by payment type
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Count
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentTypes.map((type) => {
              return (
                <tr key={type.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`h-2 w-2 rounded-full bg-${type.color}-500 mr-3`}
                      ></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPercent(type.data.count, totalCount)} of total
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {type.data.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-green-900">
                      {formatCurrency(type.data.paid)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
