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

/**
 * Extract time in HH:MM format from a date
 * @param date - The date to extract time from
 * @returns Time string in HH:MM format (24-hour)
 */
export function extractTime(date: Date | string | number): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error extracting time:", error);
    return "";
  }
}
