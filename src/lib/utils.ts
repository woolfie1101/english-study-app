/**
 * Get current local date/time with explicit Asia/Seoul timezone
 * Format: YYYY-MM-DDTHH:mm:ss+09:00
 *
 * IMPORTANT: Always returns Korea Standard Time (KST/UTC+9)
 * This ensures data is stored with correct timezone regardless of server location
 */
export function getLocalDateTimeString(date: Date = new Date()): string {
  // Get Korea time components
  const koreaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = koreaTime.getFullYear();
  const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
  const day = String(koreaTime.getDate()).padStart(2, '0');
  const hours = String(koreaTime.getHours()).padStart(2, '0');
  const minutes = String(koreaTime.getMinutes()).padStart(2, '0');
  const seconds = String(koreaTime.getSeconds()).padStart(2, '0');

  // Always use +09:00 for Korea timezone
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
}

/**
 * Get current date as string in Korea timezone
 * Format: YYYY-MM-DD
 */
export function getLocalDateString(date: Date = new Date()): string {
  // Get Korea date
  const koreaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = koreaTime.getFullYear();
  const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
  const day = String(koreaTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Extract date string from a date object or ISO string in Korea timezone
 * Format: YYYY-MM-DD
 * IMPORTANT: Converts UTC timestamps to Korea timezone (Asia/Seoul) before extracting date
 */
export function extractLocalDateString(dateInput: Date | string): string {
  // Parse input to Date object
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  // Convert to Korea timezone and extract date
  return getLocalDateString(date);
}
