"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "../components/custom/Navbar";
import { SeatGrid } from "../components/custom/SeatGrid";
import { TicketDialog } from "../components/custom/TicketDialog";
import { useSeatBooking } from "../hooks/useSeatBooking";
import { generateTicketId } from "@/lib/generateTicketId";
import { RotateCcw, Check } from "lucide-react";
import Footer from "@/components/custom/Footer";

const CINEMA_ROWS = 6;
const SEATS_PER_ROW = 10;
const CINEMA_NAME = "Cineplex Theatre";
const MOVIE_TITLE = "The Blockbuster Movie";

export default function Home() {
  const {
    selectedSeats,
    bookedSeats,
    toggleSeat,
    confirmBooking,
    clearSelection,
    resetBookings,
    isLoaded,
  } = useSeatBooking();

  const [ticketId, setTicketId] = useState<string | null>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-app-gray-300 border-t-app-blue-600" />
          <p className="text-app-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = () => {
    const newTicketId = generateTicketId();
    setTicketId(newTicketId);
    setShowTicketDialog(true);
    confirmBooking();
  };

  const handleCloseTicketDialog = () => {
    setShowTicketDialog(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-app-gray-50">
      <Navbar
        selectedSeatsCount={selectedSeats.length}
        bookedSeatsCount={bookedSeats.length}
      />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-app-gray-900">
              Select Your Seats
            </h2>
            <p className="text-app-gray-600">
              Choose your preferred seats for {MOVIE_TITLE}
            </p>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Seat Grid Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Seating Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <SeatGrid
                    rows={CINEMA_ROWS}
                    seatsPerRow={SEATS_PER_ROW}
                    selectedSeats={selectedSeats}
                    bookedSeats={bookedSeats}
                    onToggleSeat={toggleSeat}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary Section */}
            <div className="flex flex-col gap-4">
              {/* Cinema Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-app-gray-600">Cinema</p>
                    <p className="font-semibold text-app-gray-900">
                      {CINEMA_NAME}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-app-gray-600">Movie</p>
                    <p className="font-semibold text-app-gray-900">
                      {MOVIE_TITLE}
                    </p>
                  </div>
                  <hr className="border-app-gray-200" />
                  <div>
                    <p className="text-sm text-app-gray-600">Selected Seats</p>
                    {selectedSeats.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedSeats.map((seatNum) => {
                          const row = Math.floor(seatNum / SEATS_PER_ROW);
                          const col = (seatNum % SEATS_PER_ROW) + 1;
                          const rowLabel = String.fromCharCode(65 + row);
                          return (
                            <span
                              key={seatNum}
                              className="rounded bg-app-blue-100 px-2 py-1 text-sm font-semibold text-app-blue-900"
                            >
                              {rowLabel}
                              {col}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-app-gray-600">
                        No seats selected
                      </p>
                    )}
                  </div>
                  <hr className="border-app-gray-200" />
                  <div className="text-right">
                    <p className="text-sm text-app-gray-600">Total Price</p>
                    <p className="text-2xl font-bold text-app-gray-900">
                      ${selectedSeats.length * 12}
                    </p>
                    <p className="text-xs text-app-gray-500">
                      {selectedSeats.length} × $12
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleConfirmBooking}
                  disabled={selectedSeats.length === 0}
                  className="w-full gap-2 bg-app-green-600 hover:bg-app-green-700 disabled:bg-app-gray-300"
                >
                  <Check className="h-4 w-4" />
                  Confirm Booking ({selectedSeats.length})
                </Button>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  disabled={selectedSeats.length === 0}
                  className="w-full"
                >
                  Clear Selection
                </Button>
                <Button
                  onClick={resetBookings}
                  variant="outline"
                  className="w-full gap-2 text-app-red-600 hover:text-app-red-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset All
                </Button>
              </div>

              {/* Info Box */}
              <Card className="border-app-blue-200 bg-app-blue-50">
                <CardContent className="pt-6">
                  <p className="text-xs text-app-gray-600">
                    <strong>💡 Tip:</strong> Click on available seats to select
                    them. A confirmation dialog will appear after you confirm
                    your booking. You can download your ticket as TXT or JSON.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Ticket Dialog */}
      {ticketId && (
        <TicketDialog
          isOpen={showTicketDialog}
          onClose={handleCloseTicketDialog}
          ticketId={ticketId}
          selectedSeats={selectedSeats}
          seatsPerRow={SEATS_PER_ROW}
          cinemaName={CINEMA_NAME}
          movieTitle={MOVIE_TITLE}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
