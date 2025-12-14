namespace CinemaCore

open System

type SeatState =
    | Available
    | Booked

type SeatPosition = { Row: int; Number: int }

type BookingError =
    | InvalidSeats of SeatPosition list
    | AlreadyBooked of SeatPosition list

type TicketId = TicketId of string
type HallId = HallId of string

type Ticket =
    { Id: TicketId
      HallId: HallId
      Seats: SeatPosition list
      IssuedAt: DateTime }

type CinemaState =
    { HallId: HallId
      Rows: int
      SeatsPerRow: int
      Seats: SeatState[,]
      NextTicketNumber: int }
