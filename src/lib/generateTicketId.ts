/**
 * Generate a unique ticket ID using timestamp and random string
 * Format: TICKET-YYYYMMDD-HHMMSS-XXXXX (where XXXXX is random)
 */
export function generateTicketId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `TICKET-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

/**
 * Convert seat numbers to seat labels (e.g., [0, 5, 12] -> ["A1", "A6", "B1"])
 */
export function seatNumberToLabel(
  seatNumber: number,
  seatsPerRow: number
): string {
  const row = Math.floor(seatNumber / seatsPerRow);
  const col = seatNumber % seatsPerRow;

  const rowLabel = String.fromCharCode(65 + row); // 65 is 'A'
  const seatLabel = col + 1;

  return `${rowLabel}${seatLabel}`;
}

/**
 * Convert array of seat numbers to formatted labels
 */
export function formatSeats(
  seatNumbers: number[],
  seatsPerRow: number
): string[] {
  return seatNumbers.map((num) => seatNumberToLabel(num, seatsPerRow));
}

/**
 * Format date to readable format
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string): void {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
