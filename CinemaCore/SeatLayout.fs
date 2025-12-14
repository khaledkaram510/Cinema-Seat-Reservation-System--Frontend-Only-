namespace CinemaCore

module SeatLayout =

    let isValidPosition (state: CinemaState) (pos: SeatPosition) =
        pos.Row >= 1 && pos.Row <= state.Rows
        && pos.Number >= 1 && pos.Number <= state.SeatsPerRow

    let getSeatState (state: CinemaState) (pos: SeatPosition) : SeatState option =
        if isValidPosition state pos then
            Some state.Seats[pos.Row - 1, pos.Number - 1]
        else
            None

    /// Immutable-style update: clone array then set seat
    let setSeatState (state: CinemaState) (pos: SeatPosition) (newState: SeatState) : CinemaState =
        let newSeats = state.Seats.Clone() :?> SeatState[,]
        newSeats[pos.Row - 1, pos.Number - 1] <- newState
        { state with Seats = newSeats }

    /// Create a new hall (rows × seatsPerRow) with all seats Available
    let createHall (hallId: string) (rows: int) (seatsPerRow: int) : CinemaState =
        let seats = Array2D.create rows seatsPerRow Available
        { HallId = HallId hallId
          Rows = rows
          SeatsPerRow = seatsPerRow
          Seats = seats
          NextTicketNumber = 1 }
