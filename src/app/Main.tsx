"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "../components/custom/Navbar";
import { SeatGrid } from "../components/custom/SeatGrid";
import { TicketDialog } from "../components/custom/TicketDialog";
import type { UserData } from "../hooks/useSeatBooking";
import { useSeatBooking } from "../hooks/useSeatBooking";
import { Check, XOctagon } from "lucide-react";
import Footer from "@/components/custom/Footer";
import Loading from "@/components/custom/Loading";
import { ConfirmBookingDialog } from "@/components/custom/ConfirmBookingDialog";
import { deleteSeat } from "@/lib/utils";

const CINEMA_NAME = "Cineplex Theatre";
const MOVIE_TITLE = "The Blockbuster Movie";

export default function Main() {
  const {
    selectedSeats,
    selectedDelSeats,
    bookedSeats,
    data,
    layoutLoading,
    layoutError,
    userData,
    toggleSeat,
    toggleDelSeat,
    confirmBooking,
    clearSelection,
    clearDelSelection,
    setUserData,
    removeUserSeats,
    removeBookedSeats,
    refreshLayout,
  } = useSeatBooking();

  // const [ticketId, setTicketId] = useState<string | null>("sssfffss");
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // const [cancelSeats, setCancelSeats] = useState<number[]>([]);

  const handleConfirmBooking = (userData: UserData) => {
    // const newTicketId = generateTicketId();
    // setTicketId(ticketId);
    setUserData(userData);
    setShowConfirmDialog(false);
    setShowTicketDialog(true);
    // confirmBooking();
  };

  const myBookedSeatNumbers =
    userData?.seats.map((seat) => seat.seatNumber) ?? [];

  const handleSeatToggle = (seatNumber: number) => {
    if (myBookedSeatNumbers.includes(seatNumber)) {
      // Toggle selection for cancellation
      console.log("toggling del seat:", seatNumber);
      toggleDelSeat(seatNumber);
    } else {
      // Default selection behavior for new bookings
      toggleSeat(seatNumber);
    }
  };

  const handleCloseTicketDialog = () => {
    setShowTicketDialog(false);
    confirmBooking();
    refreshLayout();
  };
  // const handleSuccessTicketDialog = () => {
  //   // setShowTicketDialog(false);
  //   confirmBooking();
  // };
  const getTicketId = () => {
    if (userData?.seats?.length) {
      console.log("finding ticket id for seat:", selectedSeats[0]);
      const id = userData.seats.find(
        (seat) => seat.seatNumber === selectedSeats[0]
      )?.ticketId;
      console.log("found ticket id:", id);
      return id || "";
    }
    return "";
  };

  // const handle = () => {
  //   // const newTicketId = generateTicketId();
  //   // setTicketId(newTicketId);
  //   setShowTicketDialog(true);
  //   // confirmBooking();
  // };

  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  const handleCancelBooking = async () => {
    if (!userData || selectedDelSeats.length === 0) return;

    const seatsToCancel = userData.seats.filter((seat) =>
      selectedDelSeats.includes(seat.seatNumber)
    );
    console.log("seats to cancel:", seatsToCancel);

    try {
      const response = await deleteSeat(seatsToCancel[0].ticketId);
      console.log("Cancellation response:", response);
      // Update local state after successful cancellation
      removeUserSeats(selectedDelSeats);
      removeBookedSeats(selectedDelSeats);
      // setCancelSeats([]);
      clearSelection();
      clearDelSelection();
      refreshLayout();
    } catch (error) {
      console.error("Failed to cancel booking", error);
    }
  };

  if (layoutError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-gray-50">
        <Card>
          <CardContent className="p-6 text-center text-app-red-600">
            Failed to load layout. Please try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (layoutLoading || !data) {
    return <Loading />;
  }

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
                    rows={data.rows}
                    seatsPerRow={data.cols}
                    selectedSeats={selectedSeats}
                    selectedDelSeats={selectedDelSeats}
                    bookedSeats={bookedSeats}
                    onToggleSeat={handleSeatToggle}
                    userData={userData}
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
                    {selectedSeats.length > 0 || selectedDelSeats.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedSeats.map((seatNum) => {
                          const row = Math.floor(seatNum / data.cols);
                          const col = (seatNum % data.cols) + 1;
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
                        {selectedDelSeats.map((seatNum) => {
                          const row = Math.floor(seatNum / data.cols);
                          const col = (seatNum % data.cols) + 1;
                          const rowLabel = String.fromCharCode(65 + row);
                          return (
                            <span
                              key={seatNum}
                              className="rounded bg-app-red-100 px-2 py-1 text-sm font-semibold text-app-red-900"
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
                      ${(selectedSeats.length - selectedDelSeats.length) * 12}
                    </p>
                    <p className="text-xs text-app-gray-500">
                      {selectedSeats.length - selectedDelSeats.length} × $12
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => setShowConfirmDialog(true)}
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
                  onClick={handleCancelBooking}
                  variant="outline"
                  disabled={selectedDelSeats.length === 0}
                  className="w-full gap-2 text-app-red-600 hover:text-app-red-700 disabled:text-app-gray-400"
                >
                  <XOctagon className="h-4 w-4" />
                  Cancel Booking
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

      {/* Confirm Booking Dialog */}
      <ConfirmBookingDialog
        isOpen={showConfirmDialog}
        // isOpen={true}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmBooking}
        selectedSeats={selectedSeats}
        totalPrice={selectedSeats.length * 12}
        seatsPerRow={data.cols}
      />

      {/* Ticket Dialog */}
      {userData && (
        <TicketDialog
          onSuccess={confirmBooking}
          isOpen={showTicketDialog}
          onClose={handleCloseTicketDialog}
          ticketId={getTicketId()}
          selectedSeats={userData.seats.filter((seat) =>
            selectedSeats.includes(seat.seatNumber)
          )}
          seatsPerRow={data.cols}
          cinemaName={CINEMA_NAME}
          movieTitle={MOVIE_TITLE}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
