namespace CinemaCore

open SeatLayout
open Booking
open Ticketing
open Display

module Cinema =

    /// Used by UI to create a hall
    let initCinema (hallId: string) (rows: int) (seatsPerRow: int) : CinemaState =
        createHall hallId rows seatsPerRow

    /// Used by UI to display seat map
    let displayMap (state: CinemaState) : string list =
        Display.displayMap state

    /// Used by UI to print ticket
    let formatTicket (ticket: Ticket) : string =
        Ticketing.formatTicket ticket

    /// Main booking wrapper for C#
    let bookSeatsDto (state: CinemaState) (requested: SeatPosition list) : BookingResultDto =
        match Booking.bookSeats state requested with
        | Error (InvalidSeats seats) ->
            let msg =
                seats
                |> List.map (fun s -> sprintf "(R%d,%d)" s.Row s.Number)
                |> String.concat ", "
                |> sprintf "Invalid seats: %s"

            { IsSuccess = false
              NewState = state
              Ticket = Unchecked.defaultof<Ticket>
              Error = msg }

        | Error (AlreadyBooked seats) ->
            let msg =
                seats
                |> List.map (fun s -> sprintf "(R%d,%d)" s.Row s.Number)
                |> String.concat ", "
                |> sprintf "Already booked seats: %s"

            { IsSuccess = false
              NewState = state
              Ticket = Unchecked.defaultof<Ticket>
              Error = msg }

        | Ok bookedState ->
            let ticket = Ticketing.makeTicket bookedState requested
            let finalState = Ticketing.advanceTicketCounter bookedState

            { IsSuccess = true
              NewState = finalState
              Ticket = ticket
              Error = null }
