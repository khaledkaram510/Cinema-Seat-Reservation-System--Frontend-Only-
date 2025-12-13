"use client";

import { useEffect, useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadFile, formatDate, formatSeats } from "@/lib/generateTicketId";
import { Copy, Download, Check } from "lucide-react";
import {
  handleFormAction,
  type BookingActionState,
} from "@/app/actions/bookingActions";
import Form from "next/form";
import { UserData } from "@/hooks/useSeatBooking";

interface ConfirmBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userData: UserData) => void;
  selectedSeats: number[];
  seatsPerRow: number;
  totalPrice: number;
  cinemaName?: string;
  movieTitle?: string;
}

const initialBookingState: BookingActionState = {
  success: false,
  message: "",
  data: undefined,
};

export function ConfirmBookingDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedSeats,
  seatsPerRow,
  totalPrice,
  cinemaName = "Cineplex Theatre",
  movieTitle = "Select a Movie",
}: ConfirmBookingDialogProps) {
  // const [copied, setCopied] = useState(false);
  const [bookingState, formAction] = useActionState(
    handleFormAction,
    initialBookingState
  );

  const selectedSeatByLabels = formatSeats(selectedSeats, seatsPerRow);
  const bookingDate = new Date();

  useEffect(() => {
    if (bookingState.success) {
      console.log("Booking confirmed:", bookingState.data);
      // setUserdata(bookingState.data);
      onConfirm(bookingState.data as UserData);
      onClose();
    }
  }, [bookingState]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="">Confirm Booking</DialogTitle>
          <DialogDescription>
            You are about to book {selectedSeatByLabels.length} seat
            {selectedSeatByLabels.length > 1 ? "s" : ""} for a total price of{" "}
            <span className="font-bold">${totalPrice}</span>. Please review your
            booking details below.
          </DialogDescription>
        </DialogHeader>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-app-gray-600">Cinema</p>
                <p className="font-semibold">{cinemaName}</p>
              </div>
              <div>
                <p className="text-sm text-app-gray-600">Movie</p>
                <p className="font-semibold">{movieTitle}</p>
              </div>
              <div>
                <p className="text-sm text-app-gray-600">Booking Date</p>
                <p className="font-semibold">{formatDate(bookingDate)}</p>
              </div>
              <div>
                <p className="text-sm text-app-gray-600">Total Seats</p>
                <p className="font-semibold">{selectedSeatByLabels.length}</p>
              </div>
            </div>

            {/* Seats Booked */}
            <div className="border-t border-app-gray-200 pt-3">
              <p className="text-sm text-app-gray-600">Seats Booked</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSeatByLabels.map((seat) => (
                  <span
                    key={seat}
                    className="rounded-md bg-app-blue-100 px-3 py-1 font-semibold text-app-blue-900"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info Form */}
        <Form action={formAction}>
          <div className=" grid gap-4">
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <Label htmlFor="name-1">Name :</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <Label htmlFor="email-1">Email :</Label>
              <Input
                type="email"
                id="email-1"
                name="email"
                defaultValue="youremail@email.com"
              />
            </div>
            {/* // for only more than one seat */}
            {/* <Input type="hidden" name="seats" value={selectedSeats.toLocaleString()} ></Input>  */}
            {/* // for only one seat */}
            <Input
              type="hidden"
              name="seats"
              value={selectedSeatByLabels[0] ?? ""}
            />
          </div>

          {bookingState.message && (
            <p className="mt-3 text-sm text-app-gray-700">
              {bookingState.message}
            </p>
          )}

          <DialogFooter className="mt-5 flex gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              // onClick={handleDownloadTicket}
              type="submit"
              className="px-10 bg-app-blue-600 hover:bg-app-blue-700 "
            >
              {/* <Download className="h-4 w-4" /> */}
              <Check className=" h-4 w-4" />
              Confirm
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
