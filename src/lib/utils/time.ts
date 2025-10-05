// src/lib/utils/time.ts

/**
 * Convert military time (HH:mm) to 12-hour format (h:mm AM/PM)
 */
export function formatTime(militaryTime?: string): string {
  if (!militaryTime) return "";

  const [hours, minutes] = militaryTime.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) return militaryTime;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format time range for display
 */
export function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return "";
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}
