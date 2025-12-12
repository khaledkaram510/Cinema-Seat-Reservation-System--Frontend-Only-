"use client";

import { Seat } from "./Seat";

interface SeatGridProps {
  rows: number;
  seatsPerRow: number;
  selectedSeats: number[];
  bookedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
}

export function SeatGrid({
  rows,
  seatsPerRow,
  selectedSeats,
  bookedSeats,
  onToggleSeat,
}: SeatGridProps) {
  const seatRows = Array.from({ length: rows }, (_, rowIndex) => {
    return Array.from({ length: seatsPerRow }, (_, colIndex) => {
      const seatNumber = rowIndex * seatsPerRow + colIndex;
      return seatNumber;
    });
  });

  return (
    <div className="space-y-4">
      {/* Screen indicator */}
      <div className="relative">
        <div className="mx-auto max-w-2xl border-b-4 border-app-gray-800 pb-2 text-center">
          <p className="text-sm font-semibold text-app-gray-600">SCREEN</p>
        </div>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col gap-3">
        {seatRows.map((row, rowIndex) => {
          const rowLabel = String.fromCharCode(65 + rowIndex); // A, B, C, etc.

          return (
            <div
              key={rowLabel}
              className="flex items-center justify-center gap-2"
            >
              {/* Row label */}
              <span className="w-8 text-center text-sm font-semibold text-app-gray-600">
                {rowLabel}
              </span>

              {/* Seats in this row */}
              <div className="flex gap-2">
                {row.map((seatNumber) => (
                  <Seat
                    key={seatNumber}
                    seatNumber={seatNumber}
                    isSelected={selectedSeats.includes(seatNumber)}
                    isBooked={bookedSeats.includes(seatNumber)}
                    onToggle={onToggleSeat}
                    rowLabel={rowLabel}
                    colNumber={(seatNumber % seatsPerRow) + 1}
                  />
                ))}
              </div>

              {/* Row label (right side) */}
              <span className="w-8 text-center text-sm font-semibold text-app-gray-600">
                {rowLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 rounded-lg border border-app-gray-200 bg-app-gray-50 p-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded border-2 border-app-gray-300 bg-app-white" />
          <span className="text-sm text-app-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded border-2 border-app-blue-500 bg-app-blue-500" />
          <span className="text-sm text-app-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded border-2 border-app-gray-400 bg-app-gray-300" />
          <span className="text-sm text-app-gray-600">Booked</span>
        </div>
      </div>
    </div>
  );
}
