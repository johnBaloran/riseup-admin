// src/lib/utils/tax-rates.ts

/**
 * Canadian Tax Rates by Province/Territory
 * Updated as of 2025
 */

export const CANADIAN_TAX_RATES: Record<string, number> = {
  // Provinces with HST (Harmonized Sales Tax)
  "Ontario": 0.13,                    // 13% HST
  "New Brunswick": 0.15,              // 15% HST
  "Newfoundland and Labrador": 0.15,  // 15% HST
  "Nova Scotia": 0.15,                // 15% HST
  "Prince Edward Island": 0.15,       // 15% HST

  // Provinces with GST + PST
  "British Columbia": 0.12,           // 5% GST + 7% PST = 12%
  "Saskatchewan": 0.11,               // 5% GST + 6% PST = 11%
  "Manitoba": 0.12,                   // 5% GST + 7% PST = 12%
  "Quebec": 0.14975,                  // 5% GST + 9.975% QST = 14.975%

  // Territories with GST only
  "Alberta": 0.05,                    // 5% GST
  "Northwest Territories": 0.05,      // 5% GST
  "Nunavut": 0.05,                    // 5% GST
  "Yukon": 0.05,                      // 5% GST
};

/**
 * Get tax rate for a given Canadian province/territory
 * @param region - Province or territory name
 * @returns Tax rate as decimal (e.g., 0.13 for 13%)
 */
export function getTaxRateByRegion(region: string): number {
  const normalizedRegion = region.trim();
  const taxRate = CANADIAN_TAX_RATES[normalizedRegion];

  if (!taxRate) {
    console.warn(`Tax rate not found for region: ${region}. Using default 13% (Ontario HST)`);
    return 0.13; // Default to Ontario's 13% HST
  }

  return taxRate;
}

/**
 * Calculate tax amount
 * @param amount - Base amount before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.13)
 * @returns Tax amount
 */
export function calculateTax(amount: number, taxRate: number): number {
  return amount * taxRate;
}

/**
 * Calculate total including tax
 * @param amount - Base amount before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.13)
 * @returns Total amount including tax
 */
export function calculateTotalWithTax(amount: number, taxRate: number): number {
  return amount + calculateTax(amount, taxRate);
}

/**
 * Format tax rate as percentage string
 * @param taxRate - Tax rate as decimal (e.g., 0.13)
 * @returns Formatted percentage (e.g., "13%")
 */
export function formatTaxRate(taxRate: number): string {
  return `${(taxRate * 100).toFixed(2)}%`;
}
