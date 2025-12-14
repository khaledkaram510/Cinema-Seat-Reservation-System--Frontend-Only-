import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const USE_API_MOCK =
  process.env.NEXT_PUBLIC_USE_API_MOCK === "true" ||
  process.env.USE_API_MOCK === "true";

const MOCK_LAYOUT = {
  rows: 3,
  cols: 4,
  seats: {
    a1: "available",
    a2: "available",
    a3: "available",
    a4: { status: "booked", ticketId: "MOCK-TICKET-A4" },
    b1: "available",
    b2: { status: "booked", ticketId: "MOCK-TICKET-B2" },
    b3: "available",
    b4: "available",
    c1: "available",
    c2: "available",
    c3: "available",
    c4: "available",
  },
};

export async function getLayout() {
  if (USE_API_MOCK) {
    return MOCK_LAYOUT;
  }

  try {
    const data = await fetch("http://localhost:8080/layout", {
      cache: "no-store",
    });
    return data.json();
  } catch (error) {
    console.warn("Falling back to mock layout due to fetch error", error);
    return MOCK_LAYOUT;
  }
}

export async function deleteSeat(ticketId: string) {
  if (USE_API_MOCK) {
    return { success: true, ticketId };
  }

  const response = await fetch(`http://localhost:8080/book/${ticketId}`, {
    method: "DELETE",
  });
  return response.json();
}
