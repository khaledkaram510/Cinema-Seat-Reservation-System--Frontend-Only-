"use client";

import { cn } from "@/lib/utils";

interface SeatProps {
  seatNumber: number;
  isSelected: boolean;
  isBooked: boolean;
  onToggle: (seatNumber: number) => void;
  rowLabel: string;
  colNumber: number;
}

export function Seat({
  seatNumber,
  isSelected,
  isBooked,
  onToggle,
  rowLabel,
  colNumber,
}: SeatProps) {
  const handleClick = () => {
    if (!isBooked) {
      onToggle(seatNumber);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBooked}
      className={cn(
        "relative h-10 w-10 rounded-md border-2 transition-all duration-200",
        "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-app-blue-500 focus:ring-offset-2",
        // Booked seats
        isBooked && "cursor-not-allowed border-app-gray-400 bg-app-gray-300",
        // Selected seats
        isSelected &&
          !isBooked &&
          "border-app-blue-500 bg-app-blue-500 shadow-lg hover:border-app-blue-600 hover:bg-app-blue-600",
        // Available seats (not booked, not selected)
        !isBooked &&
          !isSelected &&
          "border-app-gray-300 bg-app-white hover:border-app-blue-400 hover:bg-app-blue-50"
      )}
      title={`Seat ${rowLabel}${colNumber} - ${
        isBooked ? "Booked" : isSelected ? "Selected" : "Available"
      }`}
      aria-label={`Seat ${rowLabel}${colNumber}`}
    >
      {/* Seat text indicator */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-xs font-bold",
          isSelected && !isBooked && "text-app-white",
          isBooked && "text-app-gray-600",
          !isBooked &&
            !isSelected &&
            "text-app-gray-400 group-hover:text-app-gray-500"
        )}
      >
        {colNumber}
      </span>
    </button>
  );
}
