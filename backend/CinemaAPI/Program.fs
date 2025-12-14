//program.fs
open System
open System.Collections.Generic
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting
open Microsoft.AspNetCore.Http
open Cinema
open Microsoft.Extensions.DependencyInjection
open Microsoft.AspNetCore.Cors.Infrastructure

type SeatRequest = { seatCode: string; username: string; email: string }

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)

    // Add Swagger services
    builder.Services.AddEndpointsApiExplorer() |> ignore
    builder.Services.AddSwaggerGen() |> ignore

    // Configure CORS to allow the frontend at localhost:3000
    builder.Services.AddCors(fun options ->
        options.AddPolicy("AllowFrontend", fun policy ->
            policy
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
            |> ignore)
    ) |> ignore

    let app = builder.Build()

    // Enable swagger in development mode
    if app.Environment.IsDevelopment() then
        app.UseSwagger() |> ignore
        app.UseSwaggerUI() |> ignore

    // Enable CORS
    app.UseCors("AllowFrontend") |> ignore

    // in-memory layout shared by endpoints (adjust rows/cols as needed)
    let layout = Seats.createLayout 10 8   // rows = 10, cols = 8

    // in-memory store: ticketId -> (username, email)
    let ticketUsers = Dictionary<string, struct (string * string)>()

    // simple GET
    app.MapGet("/", Func<string>(fun () -> "Hello World!")) |> ignore

    // POST /book  { "seatCode": "A3", "username": "...", "email": "..." }
    app.MapPost("/book", Func<SeatRequest, IResult>(fun req ->
        match Seats.bookByCode layout req.seatCode with
        | Ok ticketId ->
            // store user info for this ticket
            ticketUsers[ticketId] <- struct (req.username, req.email)

            Results.Ok
                {| ticket = ticketId
                   seat = req.seatCode
                   username = req.username
                   email = req.email |}
        | Error msg ->
            Results.BadRequest {| error = msg |}
    )) |> ignore

    // GET /seats/{seatCode}
    app.MapGet("/seats/{seatCode}", Func<string, IResult>(fun seatCode ->
        match Seats.getStatusByCode layout seatCode with
        | Ok status ->
            match status with
            | Available ->
                Results.Ok
                    {| seat = seatCode
                       status = "Available" |}
            | Booked ticketId ->
                match ticketUsers.TryGetValue ticketId with
                | true, struct (username, email) ->
                    Results.Ok
                        {| seat = seatCode
                           status = "Booked"
                           ticket = ticketId
                           username = username
                           email = email |}
                | false, _ ->
                    // ticket exists in layout but we have no user info
                    Results.Ok
                        {| seat = seatCode
                           status = "Booked"
                           ticket = ticketId |}
        | Error msg ->
            Results.BadRequest {| error = msg |}
    )) |> ignore

    // DELETE /book/{ticketId}
    app.MapDelete("/book/{ticketId}", Func<string, IResult>(fun ticketId ->
        let rows = Array2D.length1 layout
        let cols = Array2D.length2 layout

        // find the seat that has this ticketId
        let mutable found = false
        let mutable foundRow = 0
        let mutable foundCol = 0

        for r in 0 .. rows - 1 do
            for c in 0 .. cols - 1 do
                if not found then
                    match layout.[r, c] with
                    | Booked t when t = ticketId ->
                        found <- true
                        foundRow <- r
                        foundCol <- c
                    | _ -> ()

        if not found then
            Results.NotFound {| error = "Ticket not found" |}
        else
            // clear the seat
            layout.[foundRow, foundCol] <- Available

            // remove stored user info, if any
            ticketUsers.Remove ticketId |> ignore

            let seatCode =
                let rowChar = Seats.indexToRowChar foundRow
                sprintf "%c%d" rowChar (foundCol + 1)

            Results.Ok
                {| seat = seatCode
                   status = "Cancelled"
                   ticket = ticketId |}
    )) |> ignore

    // GET /layout (unchanged from your last version)
    app.MapGet("/layout", Func<IResult>(fun () ->
        let rows = Array2D.length1 layout
        let cols = Array2D.length2 layout

        let seatsDict = Dictionary<string, obj>()

        for r in 0 .. rows - 1 do
            for c in 0 .. cols - 1 do
                let rowChar = Seats.indexToRowChar r
                let seatCode = sprintf "%c%d" rowChar (c + 1)

                match layout.[r, c] with
                | Available ->
                    seatsDict[seatCode] <- box "available"
                | Booked ticketId ->
                    seatsDict[seatCode] <- box {| status = "Booked"; ticket = ticketId |}

        Results.Ok {| rows = rows; cols = cols; seats = seatsDict |}
    )) |> ignore

    app.Run()
    0 // Exit code

    // second push