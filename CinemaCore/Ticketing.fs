namespace CinemaCore

open System

module Ticketing =

    let generateTicketId (nextNumber: int) =
        TicketId (sprintf "T-%04d" nextNumber)

    let makeTicket (state: CinemaState) (requested: SeatPosition list) =
        let ticketId = generateTicketId state.NextTicketNumber
        { Id = ticketId
          HallId = state.HallId
          Seats = requested
          IssuedAt = DateTime.UtcNow }

    let advanceTicketCounter (state: CinemaState) =
        { state with NextTicketNumber = state.NextTicketNumber + 1 }

    let formatTicket (ticket: Ticket) : string =
        let (TicketId tid) = ticket.Id
        let (HallId hid) = ticket.HallId

        let seatsStr =
            ticket.Seats
            |> List.map (fun s -> sprintf "(R%d,S%d)" s.Row s.Number)
            |> String.concat ", "

        sprintf
            "Hall ID   : %s\nTicket ID : %s\nSeats     : %s\nIssued At : %s"
            hid
            tid
            seatsStr
            (ticket.IssuedAt.ToString("yyyy-MM-dd HH:mm:ss"))
