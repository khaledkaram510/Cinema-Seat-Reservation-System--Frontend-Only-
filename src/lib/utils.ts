import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getLayout() {
  const data = await fetch("http://localhost:8080/layout", {
    cache: "no-store",
  });
  return data.json();
}
export async function deleteSeat(ticketId: string) {
  const response= await fetch(`http://localhost:8080/book/${ticketId}`,{
    method: "DELETE",
  });
  return response.json();
}
