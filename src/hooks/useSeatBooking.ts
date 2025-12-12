"use client";

import { useEffect, useState } from "react";

export interface SeatBookingState {
  selectedSeats: number[];
  bookedSeats: number[];
}

const STORAGE_KEY = "cinema_seat_booking";
const DEFAULT_BOOKED_SEATS = [2, 3, 5, 8, 10, 15, 18, 20, 25];

export function useSeatBooking() {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [bookedSeats, setBookedSeats] =
    useState<number[]>(DEFAULT_BOOKED_SEATS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load booking state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { selectedSeats: stored_selected, bookedSeats: stored_booked } =
          JSON.parse(stored);
        setSelectedSeats(stored_selected || []);
        setBookedSeats(stored_booked || DEFAULT_BOOKED_SEATS);
      } catch {
        setBookedSeats(DEFAULT_BOOKED_SEATS);
      }
    } else {
      setBookedSeats(DEFAULT_BOOKED_SEATS);
    }
    setIsLoaded(true);
  }, []);

  // Save booking state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedSeats,
          bookedSeats,
        })
      );
    }
  }, [selectedSeats, bookedSeats, isLoaded]);

  const toggleSeat = (seatNumber: number) => {
    // Don't allow selecting already booked seats
    if (bookedSeats.includes(seatNumber)) {
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const confirmBooking = () => {
    // Move selected seats to booked seats
    setBookedSeats((prev) => [...new Set([...prev, ...selectedSeats])]);
    setSelectedSeats([]);
  };

  const clearSelection = () => {
    setSelectedSeats([]);
  };

  const resetBookings = () => {
    setBookedSeats(DEFAULT_BOOKED_SEATS);
    setSelectedSeats([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    selectedSeats,
    bookedSeats,
    toggleSeat,
    confirmBooking,
    clearSelection,
    resetBookings,
    isLoaded,
  };
}
