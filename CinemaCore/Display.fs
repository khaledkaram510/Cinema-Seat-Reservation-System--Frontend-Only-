namespace CinemaCore

open SeatLayout

module Display =

    let displayMap (state: CinemaState) : string list =
        [ for r in 1 .. state.Rows do
            let rowSymbols =
                [ for c in 1 .. state.SeatsPerRow do
                    match getSeatState state { Row = r; Number = c } with
                    | Some Available -> "O"
                    | Some Booked -> "X"
                    | None -> "?" ]
            String.concat " " rowSymbols ]
