// src/components/features/analytics/CityBreakdown.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * City breakdown table display ONLY
 */

"use client";

import { MapPin } from "lucide-react";

interface CityBreakdownProps {
  cities: Array<{
    cityId: string;
    cityName: string;
    count: number;
    paid: number;
  }>;
  previousCities?: Array<{
    cityId: string;
    cityName: string;
    count: number;
    paid: number;
  }>;
  compareEnabled: boolean;
}

export function CityBreakdown({ cities }: CityBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalCount = cities.reduce((sum, city) => sum + city.count, 0);
  const totalPaid = cities.reduce((sum, city) => sum + city.paid, 0);

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-600" />
          City Breakdown
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Revenue distribution across cities
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payments
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cities.map((city) => {
              const percentOfTotal = formatPercent(city.count, totalCount);
              const percentPaid = formatPercent(city.paid, totalPaid);

              return (
                <tr key={city.cityId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {city.cityName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{city.count}</div>
                    <div className="text-xs text-gray-500">
                      {percentOfTotal}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-green-900">
                      {formatCurrency(city.paid)}
                    </div>
                    <div className="text-xs text-green-600">
                      {percentPaid}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(city.count / totalCount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                TOTAL
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                {totalCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-900">
                {formatCurrency(totalPaid)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
