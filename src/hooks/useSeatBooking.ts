"use client";

import { useEffect, useState } from "react";

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
  console.log("bookedSeats:", bookedSeats);
  // Load booking state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY+"_userData");
    if (stored) {
      try {
        const parsedUserData: UserData = JSON.parse(stored);
        setUserData(parsedUserData);
      } catch {
        // Ignore parsing errors
      }
    }
    // if (stored) {
    //   try {
    //     const { selectedSeats: stored_selected, bookedSeats: stored_booked } =
    //       JSON.parse(stored);
    //     setSelectedSeats(stored_selected || []);
    //     setBookedSeats(stored_booked || DEFAULT_BOOKED_SEATS);
    //   } catch {
    //     setBookedSeats(DEFAULT_BOOKED_SEATS);
    //   }
    // } else {
    //   setBookedSeats(DEFAULT_BOOKED_SEATS);
    // }
    // setIsLoaded(true);
  }, []);

  
  useEffect(() => { // NOTE: here we will make bookedSeats to be set for more performance in searching and another operations
    if (!data) return;

    const seatsObject = data.seats;

    const booked = Object.keys(seatsObject).map((seatKey, index) => {
      if (seatsObject[seatKey] !== "available") {
        return index;
      }
      return -1;
    }).filter(index => index !== -1);
    // console.log(booked);
    // If you want these to drive the hook's bookedSeats state, uncomment:
    setBookedSeats(booked);
  }, [data]);

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
    if (!userData){
    localStorage.setItem(STORAGE_KEY + "_userData", JSON.stringify(userDataParam));
    console.log("setting user data:",userDataParam);
    setUserData(userDataParam);
    }else{
      const modifiedUserDataParam = { ...userDataParam , seats: [{...userDataParam.seats[0], seatNumber: selectedSeats[0]}]};
      const mergedUserData = { ...userData, seats: [...userData.seats, ...modifiedUserDataParam.seats] };
      localStorage.setItem(STORAGE_KEY + "_userData", JSON.stringify(mergedUserData));
      console.log("merged user data:",mergedUserData);
      setUserData(mergedUserData);
    }
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
    setBookedSeats((prev) => prev.filter((seat) => !seatNumbers.includes(seat)));
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
    userData,
    toggleSeat,
    toggleDelSeat,
    confirmBooking,
    clearSelection,
    clearDelSelection,
    resetBookings,
    setData,
    setUserData :setUserDataFunction,
    removeUserSeats,
    removeBookedSeats,
    // isLoaded,
  };
}
