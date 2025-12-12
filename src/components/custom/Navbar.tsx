"use client";

import { Clapperboard } from "lucide-react";

interface NavbarProps {
  selectedSeatsCount: number;
  bookedSeatsCount: number;
}

export function Navbar({ selectedSeatsCount, bookedSeatsCount }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 border-b border-app-gray-200 bg-app-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-app-blue-600 to-app-blue-700 p-2">
              <Clapperboard className="h-6 w-6 text-app-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-app-gray-900">
                Cinema Seat Reservation
              </h1>
              <p className="text-xs text-app-gray-600">
                Book your perfect seats
              </p>
            </div>
          </div>

          {/* Booking Stats */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-app-gray-600">
                Selected
              </p>
              <p className="text-2xl font-bold text-app-blue-600">
                {selectedSeatsCount}
              </p>
            </div>
            <div className="h-12 w-px bg-app-gray-200" />
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-app-gray-600">
                Booked
              </p>
              <p className="text-2xl font-bold text-app-gray-600">
                {bookedSeatsCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
