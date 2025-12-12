"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadFile, formatDate, formatSeats } from "@/lib/generateTicketId";
import { Copy, Download, Check } from "lucide-react";

interface TicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  selectedSeats: number[];
  seatsPerRow: number;
  cinemaName?: string;
  movieTitle?: string;
}

export function TicketDialog({
  isOpen,
  onClose,
  ticketId,
  selectedSeats,
  seatsPerRow,
  cinemaName = "Cineplex Theatre",
  movieTitle = "Select a Movie",
}: TicketDialogProps) {
  const [copied, setCopied] = useState(false);

  const seatLabels = formatSeats(selectedSeats, seatsPerRow);
  const bookingDate = new Date();

  const handleCopyTicketId = async () => {
    await navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTicket = () => {
    const ticketContent = `
===========================================
         CINEMA TICKET CONFIRMATION
===========================================

Ticket ID: ${ticketId}
Cinema: ${cinemaName}
Movie: ${movieTitle}
Date: ${formatDate(bookingDate)}

SEATS BOOKED:
${seatLabels.join(", ")}

Total Seats: ${seatLabels.length}

===========================================
Keep this ticket for your records.
Valid for one-time use only.
===========================================
    `.trim();

    downloadFile(ticketContent, `ticket-${ticketId}.txt`);
  };

  const handleDownloadJSON = () => {
    const ticketData = {
      ticketId,
      cinema: cinemaName,
      movie: movieTitle,
      seatsBooked: seatLabels,
      totalSeats: seatLabels.length,
      bookingDate: bookingDate.toISOString(),
      bookingTime: formatDate(bookingDate),
    };

    downloadFile(
      JSON.stringify(ticketData, null, 2),
      `ticket-${ticketId}.json`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking Confirmed! 🎉</DialogTitle>
          <DialogDescription>
            Your seats have been successfully reserved
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ticket ID Card */}
          <Card className="border-2 border-app-blue-200 bg-app-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Ticket ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-app-white p-3 font-mono text-sm font-semibold">
                  {ticketId}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyTicketId}
                  className="shrink-0"
                  title="Copy ticket ID"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-app-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

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
                  <p className="font-semibold">{seatLabels.length}</p>
                </div>
              </div>

              {/* Seats Booked */}
              <div className="border-t border-app-gray-200 pt-3">
                <p className="text-sm text-app-gray-600">Seats Booked</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {seatLabels.map((seat) => (
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
        </div>

        <DialogFooter className="flex gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none"
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadJSON}
            className="flex-1 gap-2 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            Download JSON
          </Button>
          <Button
            onClick={handleDownloadTicket}
            className="flex-1 gap-2 bg-app-blue-600 hover:bg-app-blue-700 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            Download Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
