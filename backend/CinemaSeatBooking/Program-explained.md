# CinemaAPI `Program.fs` – Detailed Explanation

This document explains how your F# `Program.fs` works, the runtime flow, and the main language/framework concepts involved.

---

## 1. Purpose

This file defines a minimal ASP.NET Core web API that:

- Creates an in-memory layout of cinema seats.
- Provides endpoints to:
  - Book a seat.
  - Check a seat’s status.
  - Cancel a booking.
  - Get the full layout.

All data is **in memory** (no database), so state resets when the app restarts.

---

## 2. Imports and Setup

```fsharp
open System
open System.Collections.Generic
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting
open Microsoft.AspNetCore.Http
open Cinema
open Microsoft.Extensions.DependencyInjection
open Microsoft.AspNetCore.Cors.Infrastructure
```

- `System`, `System.Collections.Generic` – basic .NET types (`Dictionary`, etc.).
- ASP.NET Core:
  - `Microsoft.AspNetCore.Builder` – `WebApplication`, routing.
  - `Microsoft.Extensions.Hosting` – hosting/environment.
  - `Microsoft.AspNetCore.Http` – `IResult`, `Results`.
  - `Microsoft.Extensions.DependencyInjection` – service registration.
  - `Microsoft.AspNetCore.Cors.Infrastructure` – CORS types.
- `Cinema` – your own namespace that provides:
  - The `Seats` module.
  - The `Available` and `Booked` union cases.

**F# concept – `open`:**

- Similar to C# `using`: brings names from a namespace/module into scope.

---

## 3. Request DTO: `SeatRequest`

```fsharp
type SeatRequest = { seatCode: string; username: string; email: string }
```

- An F# **record type** with three string fields.
- ASP.NET Core model binding will deserialize JSON into this record for the `/book` endpoint.

Example request body:

```json
{
  "seatCode": "A3",
  "username": "Alice",
  "email": "alice@example.com"
}
```

**F# concept – record type:**

- Immutable by default.
- Fields accessed as `record.fieldName`.
- Very convenient for request/response models.

---

## 4. Entry Point and Builder

```fsharp
[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)
    ...
    app.Run()
    0
```

- `[<EntryPoint>]` marks `main` as the application’s entry point (like C# `Main`).
- `args` are command-line arguments.
- `WebApplication.CreateBuilder(args)`:
  - Creates the minimal hosting builder.
  - Gives you:
    - `builder.Services` – dependency injection setup.
    - `builder.Configuration` – configuration.
    - `builder.Environment` – environment info (`Development`, `Production`, etc.).

Return value `0` is the process exit code.

---

## 5. Configuring Services

### 5.1 Swagger / OpenAPI

```fsharp
builder.Services.AddEndpointsApiExplorer() |> ignore
builder.Services.AddSwaggerGen() |> ignore
```

- `AddEndpointsApiExplorer()` – lets Swagger discover minimal API endpoints.
- `AddSwaggerGen()` – registers the Swagger/OpenAPI generator.
- `|> ignore`:
  - `AddX` methods return objects; you discard them to avoid unused value warnings.

**F# concept – pipe operator `|>`:**

- `x |> f` is the same as `f x`.
- Good for chaining operations in a readable way.

### 5.2 CORS

```fsharp
builder.Services.AddCors(fun options ->
    options.AddPolicy("AllowFrontend", fun policy ->
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
        |> ignore)
) |> ignore
```

- Registers CORS services and defines a policy `AllowFrontend`:
  - Only allows requests from `http://localhost:3000` (your React/JS frontend).
  - Allows any headers and methods.
  - Allows credentials (cookies, auth headers).

**F# concepts:**

- **Lambda/anonymous functions** with `fun`:
  - `fun options -> ...`
  - `fun policy -> ...`
- Pipeline `|> ignore` to drop unused return values.

---

## 6. Building the App

```fsharp
let app = builder.Build()
```

- Creates the `WebApplication` instance from the builder.
- After this, you configure middleware and endpoints directly on `app`.

---

## 7. Middleware

### 7.1 Swagger (Dev only)

```fsharp
if app.Environment.IsDevelopment() then
    app.UseSwagger() |> ignore
    app.UseSwaggerUI() |> ignore
```

- Checks if environment is Development.
- Enables:
  - `/swagger/v1/swagger.json` – OpenAPI specification.
  - `/swagger` – Swagger UI.

### 7.2 CORS Middleware

```fsharp
app.UseCors("AllowFrontend") |> ignore
```

- Adds CORS middleware to the pipeline using the `"AllowFrontend"` policy.
- Applied to all subsequent endpoints.

**ASP.NET Core concept – middleware:**

- Each `UseX` call adds a component in the HTTP request/response pipeline.

---

## 8. In-Memory State

### 8.1 Layout

```fsharp
let layout = Seats.createLayout 10 8   // rows = 10, cols = 8
```

- Calls `Seats.createLayout` from the `Cinema.Seats` module.
- Likely returns a 2D array (`Seat[,]`) of a discriminated union like:

```fsharp
type SeatStatus =
      | Available
      | Booked of string  // ticketId
```

- Created **once** at startup and shared across all requests.

### 8.2 Ticket Users

```fsharp
let ticketUsers = Dictionary<string, struct (string * string)>()
```

- In-memory mapping from `ticketId` (string) to `struct (username * email)`.
- `struct (x, y)` is a **struct tuple** (value type tuple).
- Holds user data associated with each ticket.

**Implications:**

- State is global (effectively a singleton) while the app is running.
- No persistence – restart the app and everything resets.

---

## 9. Endpoints

### 9.1 `GET /` – Hello World

```fsharp
app.MapGet("/", Func<string>(fun () -> "Hello World!")) |> ignore
```

- Registers a GET endpoint at `/`.
- Returns a plain string `"Hello World!"`.

**Interop concept:**

- ASP.NET minimal APIs expect .NET delegates like `Func<string>`.
- Wrap the F# lambda `fun () -> "Hello World!"` into `Func<string>` to satisfy the API signature.

---

### 9.2 `POST /book` – Book a Seat

```fsharp
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
```

**Flow:**

1. Body JSON is deserialized into `SeatRequest` (`req`).
2. Calls `Seats.bookByCode layout req.seatCode`:
   - Probably returns `Result<string, string>`:
     - `Ok ticketId` – seat booked.
     - `Error msg` – invalid seat, already booked, etc.
3. Pattern match on the result:

```fsharp
match ... with
   | Ok ticketId -> ...
   | Error msg -> ...
```

4. On `Ok ticketId`:
   - Store user info in `ticketUsers`:

```fsharp
 ticketUsers[ticketId] <- struct (req.username, req.email)
```

   - Return HTTP 200 with anonymous record:

```fsharp
 {| ticket = ticketId
        seat = req.seatCode
        username = req.username
        email = req.email |}
```

5. On `Error msg`:
   - Return HTTP 400 with `{ error = msg }`.

**F# concepts here:**

- **Result type**: `Ok`/`Error` for success/failure.
- **Pattern matching**: `match ... with`.
- **Anonymous records**: `{| field = value |}` – ideal for JSON responses.
- Indexer syntax for `Dictionary`: `ticketUsers[key] <- value`.

---

### 9.3 `GET /seats/{seatCode}` – Seat Status

```fsharp
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
```

**Flow:**

1. `seatCode` is bound from the route parameter.
2. `Seats.getStatusByCode layout seatCode` returns a `Result<SeatStatus, string>`:
   - `Ok status` where `status` is `Available` or `Booked ticketId`.
   - `Error msg` on invalid seat, etc.
3. On `Error msg`: return 400 `{ error = msg }`.
4. On `Ok status`:
   - Match again on `status`:

     - `Available`:
       - Response: `{ seat = ..., status = "Available" }`.

     - `Booked ticketId`:
       - Try to get user from `ticketUsers`:

```fsharp
     match ticketUsers.TryGetValue ticketId with
         | true, struct (username, email) -> ...
         | false, _ -> ...
```

       - If found: return seat + ticket + username + email.
       - If not: return seat + ticket only.

**F# concepts:**

- **Nested pattern matches**:
  - First on `Result`, then on discriminated union `Available | Booked ticketId`.
  - Then on the tuple returned by `TryGetValue` (`bool * value`).
- **Discriminated unions**:
  - `Available` / `Booked` represent distinct states.

---

### 9.4 `DELETE /book/{ticketId}` – Cancel Booking

```fsharp
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
```

**Search phase:**

- `rows`, `cols` get the dimensions of the 2D array (`layout`).
- Uses `let mutable ...` for `found`, `foundRow`, `foundCol`.
- Double `for` loop scans the grid:
  - `layout.[r, c]` indexes the 2D array.
  - Pattern match with a **guard**:

```fsharp
| Booked t when t = ticketId -> ...
```

  - If the seat has the requested ticket id, record its coordinates.

Continuation:

```fsharp
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
```

**Cancel phase:**

- If no match: return 404 `{ error = "Ticket not found" }`.
- If found:
  - Set the seat back to `Available`:

```fsharp
layout.[foundRow, foundCol] <- Available
```

  - Remove the ticket from `ticketUsers`.
  - Reconstruct `seatCode`:
    - `Seats.indexToRowChar foundRow` ? row letter (e.g., `A`).
    - `foundCol + 1` ? seat number.
    - `sprintf "%c%d"` ? `"A3"` style string.
  - Return 200 with `{ seat, status = "Cancelled", ticket }`.

**F# concepts:**

- **Mutable values**: `let mutable x = ...`.
- **2D arrays**: `layout.[r, c]`.
- **Pattern guards**: `| Booked t when t = ticketId ->`.

---

### 9.5 `GET /layout` – Full Layout

```fsharp
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
```

**Flow:**

1. Get `rows` and `cols` from layout.
2. Create `seatsDict : Dictionary<string, obj>`.
3. For each (row, col):
   - Construct `seatCode` like `"A1"`, `"B4"`, etc.
   - Pattern match on `layout.[r, c]`:
     - `Available` ? store `"available"` (string).
     - `Booked ticketId` ? store an anonymous record `{| status = "Booked"; ticket = ticketId |}`.
   - Both are stored as `obj` using `box`, because the dictionary requires a single value type.
4. Return an anonymous record:

```fsharp
{| rows= rows; cols = cols; seats = seatsDict |}
```

   which serializes to JSON.

**F# concepts:**

- **Boxing** (`box`):
  - Converts any value to `obj` to fit a heterogeneous payload in one dictionary.
- **Anonymous records** for nested response data.

---

## 10. Application Run

```fsharp
app.Run()
0 // Exit code
```

- `app.Run()` starts the web server (Kestrel) and blocks until shutdown.
- `0` is returned as the process exit code after the app stops.

---

## 11. F# Language Concepts Summary

Your `Program.fs` uses:

- **Record types** – `SeatRequest` and anonymous response records.
- **Discriminated unions** – `Available`, `Booked` from your domain module.
- **Pattern matching** – on `Result`, unions, and tuples.
- **Pattern guards** – `| Booked t when t = ticketId ->`.
- **Pipelining** with `|>` – especially `|> ignore`.
- **Anonymous records** – `{| ... |}` for JSON responses.
- **Mutable state**:
  - `let mutable found = ...`
  - Modifying arrays and dictionaries.
- **2D arrays** (`Array2D`) – seat layout.
- **Interop with C# APIs**:
  - `Func<...>` delegates.
  - ASP.NET Core `Results`, `IResult`, CORS, Swagger.
- **Boxing** – `box` to put different types into `Dictionary<string, obj>`.

---

## 12. Request Flow Overview

1. Application starts in `main` and builds `WebApplication`.
2. Registers services (Swagger, CORS).
3. Builds app and configures middleware (Swagger in dev, CORS).
4. Creates in-memory `layout` and `ticketUsers`.
5. Maps endpoints:
   - `/` test route.
   - `/book` – seat booking.
   - `/seats/{seatCode}` – get single seat status.
   - `/book/{ticketId}` – cancel booking.
   - `/layout` – full layout state.
6. `app.Run()` starts the HTTP server and handles requests according to these routes.

---
