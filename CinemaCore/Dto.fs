namespace CinemaCore

type BookingResultDto =
    { IsSuccess: bool
      NewState: CinemaState
      Ticket: Ticket
      Error: string }
