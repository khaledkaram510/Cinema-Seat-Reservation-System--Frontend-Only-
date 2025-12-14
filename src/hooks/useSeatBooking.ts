"use client";

import { useCallback, useEffect, useState } from "react";
import { getLayout } from "@/lib/utils";

export interface SeatBookingState {
  selectedSeats: number[];
  bookedSeats: number[];
}

const STORAGE_KEY = "cinema_seat_booking";
const DEFAULT_BOOKED_SEATS = [2, 3, 5, 8, 10, 15, 18, 20, 25];

type SeatId = string; // e.g. "a1", "a2"

type SeatAvailable = "available";

interface SeatBooked {
  status: string;
  ticketId: string;
}

type SeatValue = SeatAvailable | SeatBooked;

export interface SeatLayout {
  rows: number;
  cols: number;
  seats: Record<SeatId, SeatValue>;
}
export interface UserData {
  name: string;
  email: string;
  // ticketId: string;
  seats: {
    seatNumber: number;
    ticketId: string;
    seatTitle: string;
  }[];
  // Add other user data fields as needed
}

export function useSeatBooking() {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedDelSeats, setSelectedDelSeats] = useState<number[]>([]);

  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<SeatLayout | null>(null);
  const [layoutLoading, setLayoutLoading] = useState(true);
  const [layoutError, setLayoutError] = useState<Error | null>(null);
  console.log("bookedSeats:", bookedSeats);
  // Load booking state from localStorage on mount
  // useEffect(() => {

  //   // if (stored) {
  //   //   try {
  //   //     const { selectedSeats: stored_selected, bookedSeats: stored_booked } =
  //   //       JSON.parse(stored);
  //   //     setSelectedSeats(stored_selected || []);
  //   //     setBookedSeats(stored_booked || DEFAULT_BOOKED_SEATS);
  //   //   } catch {
  //   //     setBookedSeats(DEFAULT_BOOKED_SEATS);
  //   //   }
  //   // } else {
  //   //   setBookedSeats(DEFAULT_BOOKED_SEATS);
  //   // }
  //   // setIsLoaded(true);
  // }, []);

  const loadLayout = useCallback(async () => {
    setLayoutLoading(true);
    try {
      const layout = (await getLayout()) as SeatLayout;
      setData(layout);
      const seatsObject = layout.seats;
      const booked = Object.keys(seatsObject)
        .map((seatKey, index) =>
          seatsObject[seatKey] !== "available" ? index : -1
        )
        .filter((index) => index !== -1);
      setBookedSeats(booked);

      // Apply cached user data only for seats that are still booked
      let cachedUserData: UserData | null = null;
      try {
        const stored = localStorage.getItem(STORAGE_KEY + "_userData");
        if (stored) {
          cachedUserData = JSON.parse(stored) as UserData;
        }
      } catch {
        cachedUserData = null;
      }

      if (cachedUserData) {
        const filteredSeats = cachedUserData.seats.filter((seat) =>
          booked.includes(seat.seatNumber)
        );
        const modifiedUserData = { ...cachedUserData, seats: filteredSeats };
        setUserDataFunction(modifiedUserData);
      }
    } catch (error) {
      setLayoutError(error as Error);
    } finally {
      setLayoutLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadLayout();
    return () => {
      isMounted = false;
    };
  }, [loadLayout]);

  // useEffect(() => {
  //   // NOTE: here we will make bookedSeats to be set for more performance in searching and another operations
  //   if (!data) return;
  // }, [data]);

  // Save booking state to localStorage whenever it changes
  // useEffect(() => {
  //   if (isLoaded) {
  //     localStorage.setItem(
  //       STORAGE_KEY,
  //       JSON.stringify({
  //         selectedSeats,
  //         bookedSeats,
  //       })
  //     );
  //   }
  // }, [selectedSeats, bookedSeats, isLoaded]);
  const setUserDataFunction = (userDataParam: UserData) => {
    // Ensure each ticket is linked to the currently selected seat number
    const normalizedSeats = (userDataParam.seats ?? []).map((seat, index) => ({
      ...seat,
      seatNumber: selectedSeats[index] ?? seat.seatNumber,
    }));

    const baseUserData: UserData = { ...userDataParam, seats: normalizedSeats };

    if (!userData) {
      localStorage.setItem(
        STORAGE_KEY + "_userData",
        JSON.stringify(baseUserData)
      );
      console.log("setting user data:", baseUserData);
      setUserData(baseUserData);
      return;
    }

    const mergedUserData = {
      ...userData,
      seats: [...userData.seats, ...baseUserData.seats],
    };
    localStorage.setItem(
      STORAGE_KEY + "_userData",
      JSON.stringify(mergedUserData)
    );
    console.log("merged user data:", mergedUserData);
    setUserData(mergedUserData);
  };
  const removeUserSeats = (seatNumbers: number[]) => {
    if (!userData || seatNumbers.length === 0) return;
    const updatedSeats = userData.seats.filter(
      (seat) => !seatNumbers.includes(seat.seatNumber)
    );
    const updatedUserData: UserData = { ...userData, seats: updatedSeats };
    localStorage.setItem(
      STORAGE_KEY + "_userData",
      JSON.stringify(updatedUserData)
    );
    setUserData(updatedUserData);
  };

  const removeBookedSeats = (seatNumbers: number[]) => {
    if (seatNumbers.length === 0) return;
    setBookedSeats((prev) =>
      prev.filter((seat) => !seatNumbers.includes(seat))
    );
  };
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
  const toggleDelSeat = (seatNumber: number) => {
    // Don't allow selecting alFailed to execute 'json' on 'Respready booked seats
    // if (bookedSeats.includes(seatNumber)) {
    //   return;
    // }

    setSelectedDelSeats((prev) =>
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

  const clearDelSelection = () => {
    setSelectedDelSeats([]);
  };

  const resetBookings = () => {
    setBookedSeats(DEFAULT_BOOKED_SEATS);
    setSelectedSeats([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
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
    resetBookings,
    setData,
    setUserData: setUserDataFunction,
    removeUserSeats,
    removeBookedSeats,
    refreshLayout: loadLayout,
    // isLoaded,
  };
}
