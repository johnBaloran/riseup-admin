// src/lib/utils/date.ts

/**
 * Date-related utility functions
 */

import { format as formatFns } from "date-fns";

/**
 * Format a date object or string into a readable string
 * @param date - The date to format
 * @param format - The format string (e.g., "PPP", "MM/dd/yyyy")
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: string = "eee, MMM d"
): string {
  if (!date) return "";
  try {
    return formatFns(new Date(date), format);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}
