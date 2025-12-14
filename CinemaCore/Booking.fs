namespace CinemaCore

open SeatLayout

module Booking =

    let private alreadyBookedSeats (state: CinemaState) (requested: SeatPosition list) =
        requested
        |> List.choose (fun pos ->
            match getSeatState state pos with
            | Some Booked -> Some pos
            | _ -> None)

    let bookSeats (state: CinemaState) (requested: SeatPosition list)
        : Result<CinemaState, BookingError> =

        let invalidSeats =
            requested |> List.filter (fun p -> not (isValidPosition state p))

        if invalidSeats <> [] then
            Error (InvalidSeats invalidSeats)
        else
            let booked = alreadyBookedSeats state requested
            if booked <> [] then
                Error (AlreadyBooked booked)
            else
                let newState =
                    requested
                    |> List.fold (fun st pos -> setSeatState st pos Booked) state
                Ok newState
