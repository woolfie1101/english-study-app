/**
 * Get current local date/time as ISO-like string (without timezone conversion)
 * Format: YYYY-MM-DDTHH:mm:ss
 * This avoids UTC conversion issues when storing dates
 */
export function getLocalDateTimeString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Get current local date as string
 * Format: YYYY-MM-DD
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Extract date string from a date object or ISO string
 * Format: YYYY-MM-DD
 * Handles both Date objects and ISO strings in local timezone
 */
export function extractLocalDateString(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return getLocalDateString(date);
}
