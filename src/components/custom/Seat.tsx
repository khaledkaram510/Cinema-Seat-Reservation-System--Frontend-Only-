"use client";

import { cn } from "@/lib/utils";

interface SeatProps {
  seatNumber: number;
  isSelected: boolean;
  isDelSelected: boolean;
  isBooked: boolean;
  onToggle: (seatNumber: number) => void;
  rowLabel: string;
  colNumber: number;
  selectedSeats?: number[];
  selectedDelSeats?: number[];
  bookedByMe?: boolean;
}

export function Seat({
  seatNumber,
  isSelected,
  isDelSelected,
  isBooked,
  onToggle,
  rowLabel,
  colNumber,
  selectedSeats = [],
  selectedDelSeats = [],
  bookedByMe = false,
}: SeatProps) {
  const handleClick = () => {
    if (!isBooked) {
      if (selectedSeats?.length < 1) {
        onToggle(seatNumber);
      } else if (isSelected) {
        // Allow deselecting currently selected seat
        onToggle(seatNumber);
      }
    } else if (bookedByMe) {
      if( selectedDelSeats?.length < 1 ) {
        // Allow selecting seat booked by me for cancellation
        onToggle(seatNumber);
      } else if (isDelSelected) {
        // Allow deselecting currently selected seat for cancellation
        onToggle(seatNumber);
      }
      // // Allow toggling seats booked by the current user for cancellation
      // onToggle(seatNumber);
    }
  };
  console.log(isBooked, bookedByMe, isSelected,isDelSelected,seatNumber);
  // const bookedByMe = userData?.seats?.some((seat) => seat.seatNumber === seatNumber);
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBooked && !bookedByMe}
      className={cn(
        "relative h-10 w-10 rounded-md border-2 transition-all duration-200",
        "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-app-blue-500 focus:ring-offset-2",
        // Booked seats
        isBooked && "cursor-not-allowed border-app-gray-400 bg-app-gray-300 focus:ring-app-gray-400 focus:ring-offset-2",
        bookedByMe && "cursor-auto",
        // Green for booked by me
        isBooked &&
          bookedByMe &&
            !isDelSelected &&
            "border-app-green-500 bg-app-green-500 shadow-lg focus:ring-app-green-500 focus:ring-offset-2",
        // Darker green for hover on booked by me
        bookedByMe &&
          isDelSelected &&
            "border-app-red-600 bg-app-red-600 shadow-lg hover:border-app-red-700 hover:bg-app-red-600 focus:ring-app-red-700 focus:ring-offset-2",
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
          isBooked && bookedByMe && "text-app-white",
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
