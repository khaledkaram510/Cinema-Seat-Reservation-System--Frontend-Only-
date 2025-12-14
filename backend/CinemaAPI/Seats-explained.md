# CinemaAPI `Seats.fs` – Detailed Explanation

This document explains how the `Cinema.Seats` module works, what each function does, and the key F# concepts used.

---

## 1. Overview

The `Seats` module models a cinema seating layout entirely in memory. It provides functions to:

- Create a layout of seats.
- Parse human-readable seat codes (e.g., `"A3"`) into row/column indices.
- Validate seat positions.
- Book and cancel seats.
- Query the status of seats.
- Print a simple text visualization of the layout.

All state is stored in a 2D array of seat statuses.

---

## 2. Namespace and Open

```fsharp
namespace Cinema

open System
```

- `namespace Cinema` – defines the namespace for this file. Other code refers to it with `open Cinema`.
- `open System` – brings in basic .NET types (e.g., `DateTime`, `Random`, `String`, `Int32`).

---

## 3. Discriminated Union: `SeatStatus`

```fsharp
type SeatStatus =
    | Available
    | Booked of ticketId : string
```

This is an F# **discriminated union** defining the state of a single seat:

- `Available` – the seat is free.
- `Booked of ticketId : string` – the seat is booked and holds a `ticketId` string.

**Key concepts:**

- **Discriminated union**: a type that can be one of several named cases, optionally carrying data.
- The `ticketId : string` is labeled for readability but is just a `string`.

You use pattern matching later to distinguish `Available` and `Booked` seats.

---

## 4. The `Seats` Module and `Layout` Type

```fsharp
module Seats =
    type Layout = SeatStatus [,]
```

- `module Seats` – all following definitions are grouped into the `Cinema.Seats` module.
- `type Layout = SeatStatus [,]` – an alias:
  - `Layout` is a 2D array (`[,]`) of `SeatStatus`.
  - Each element is a seat.

So a `Layout` is like a grid of seats.

---

## 5. Creating a Layout

```fsharp
    let createLayout rows cols =
        Array2D.init rows cols (fun _ _ -> Available)
```

- `createLayout rows cols` creates a `rows × cols` 2D array.
- `Array2D.init` takes:
  - Number of rows.
  - Number of columns.
  - A function `(rowIndex -> colIndex -> value)`.
- Here, the function ignores indices (`fun _ _ ->`) and always returns `Available`.

Result: A fresh `Layout` where all seats are `Available`.

---

## 6. Row/Column Helpers

```fsharp
    let rowCharToIndex (ch:char) = int (Char.ToUpper ch) - int 'A'
    let indexToRowChar (i:int) = char (int 'A' + i)
```

These convert between row characters and row indices:

- `rowCharToIndex 'A'` ? `0`
- `rowCharToIndex 'B'` ? `1`
- `indexToRowChar 0` ? `'A'`
- `indexToRowChar 1` ? `'B'`

`Char.ToUpper` ensures that row letters are case-insensitive (`a` or `A` both map to 0).

```fsharp
    let inBounds rows cols r c =
        r >= 0 && r < rows && c >= 0 && c < cols
```

- Checks whether row `r` and column `c` are within 0-based bounds `[0..rows-1]` and `[0..cols-1]`.

---

## 7. Basic Seat Operations

```fsharp
    let isSeatAvailable (layout:Layout) r c =
        match layout.[r,c] with
        | Available -> true
        | Booked _ -> false
```

- `isSeatAvailable` returns `true` if the seat at `(r, c)` is `Available`, otherwise `false`.
- Uses **pattern matching** on the `SeatStatus` value at `layout.[r, c]`.

```fsharp
    let getStatus (layout:Layout) r c =
        layout.[r,c]
```

- `getStatus` returns the `SeatStatus` at `(r, c)`.

```fsharp
    let setAvailable (layout:Layout) r c =
        layout.[r,c] <- Available
```

- `setAvailable` mutates the layout, setting `(r, c)` to `Available`.
- Note: 2D arrays in F# are mutable; you update them with `<-`.

---

## 8. Parsing Seat Codes

```fsharp
    let parseSeatCode (seat:string) =
        if String.IsNullOrWhiteSpace seat || seat.Length < 2 then
            Error "Invalid seat format"
        else
            let rowChar = Char.ToUpper seat.[0]
            let row = rowCharToIndex rowChar
            let colStr = seat.Substring(1)
            match Int32.TryParse colStr with
            | true, col -> Ok (row, col - 1)
            | _ -> Error "Column must be a number"
```

Purpose: Convert a human-readable seat code like `"A3"` or `"d10"` into 0-based `(row, col)` indices.

Steps:

1. Validate the input string:
   - If `null/whitespace` or too short (`Length < 2`), return `Error "Invalid seat format"`.
2. Extract first character as the **row letter**:
   - `rowChar = Char.ToUpper seat.[0]`.
   - Convert to index: `row = rowCharToIndex rowChar`.
3. The rest of the string is the **column number**:
   - `colStr = seat.Substring(1)`.
   - Try to parse as integer: `Int32.TryParse colStr`.
4. If parse succeeds (`true, col`):
   - Convert to 0-based index: `Ok (row, col - 1)`.
5. If parse fails: `Error "Column must be a number"`.

**F# concept – `Result` type:**

- `Ok value` – success.
- `Error errorMessage` – failure.
- This avoids exceptions for normal validation errors.

---

## 9. Validating a Seat Position

```fsharp
    let validateSeat (layout:Layout) (r,c) =
        let rows = Array2D.length1 layout
        let cols = Array2D.length2 layout
        if r < 0 || r >= rows then Error "Row out of range"
        elif c < 0 || c >= cols then Error "Column out of range"
        else Ok ()
```

- Gets number of rows/cols from the `layout`.
- Checks if `(r, c)` is inside the array bounds.
- Returns:
  - `Error "Row out of range"` if `r` is invalid.
  - `Error "Column out of range"` if `c` is invalid.
  - `Ok ()` if everything is valid.

Again, this uses the `Result` type rather than throwing.

---

## 10. Ticket ID Generation

```fsharp
    let generateTicketId () =
        let now = DateTime.Now
        let stamp = now.ToString("yyyyMMdd-HHmmss")
        let rnd = Random().Next(100,999)
        $"T-{stamp}-{rnd}"
```

- Generates a string ticket ID in the format:

  `T-YYYYMMDD-HHMMSS-RRR`

  e.g., `T-20250115-123045-347`.

Details:

- `DateTime.Now` – current local time.
- `now.ToString("yyyyMMdd-HHmmss")` – formatted timestamp.
- `Random().Next(100, 999)` – random 3-digit number between 100 and 998 (inclusive).
- String interpolation `$"..."` combines pieces into one string.

Note: Using `Random()` per call is fine for small demos but can be improved in production by reusing a single `Random` instance.

---

## 11. Attempting to Book a Seat by Coordinates

```fsharp
    let tryBookSeat (layout:Layout) r c =
        if not (inBounds (Array2D.length1 layout) (Array2D.length2 layout) r c) then
            Error "out of bounds"
        else
            match layout.[r,c] with
            | Available ->
                let ticketId = generateTicketId()
                layout.[r,c] <- Booked ticketId
                Ok ticketId
            | Booked _ -> Error "already booked"
```

Purpose: Lower-level function to book using numerical row/column indices.

Steps:

1. Bounds check using `inBounds`:
   - If seat is outside layout, return `Error "out of bounds"`.
2. Pattern match on current `SeatStatus` at `(r, c)`:
   - If `Available`:
     - Generate a `ticketId` with `generateTicketId()`.
     - Mutate the layout: `layout.[r,c] <- Booked ticketId`.
     - Return `Ok ticketId`.
   - If `Booked _`:
     - Return `Error "already booked"`.

**F# concepts:**

- Pattern matching on discriminated unions (`Available` vs `Booked _`).
- Mutation with `<-` on a 2D array.

---

## 12. Booking by Seat Code

```fsharp
    let bookByCode (layout:Layout) seatCode =
        match parseSeatCode seatCode with
        | Error e -> Error e
        | Ok (r,c) ->
            match validateSeat layout (r,c) with
            | Error e -> Error e
            | Ok () -> tryBookSeat layout r c
```

This is the main function used by the API to book seats.

Flow:

1. `parseSeatCode seatCode`:
   - If `Error e` ? propagate `Error e`.
   - If `Ok (r, c)` ? proceed.
2. `validateSeat layout (r, c)`:
   - If `Error e` ? propagate `Error e`.
   - If `Ok ()` ? proceed.
3. Call `tryBookSeat layout r c` to actually book the seat.

By layering `parseSeatCode`, `validateSeat`, then `tryBookSeat`, you clearly separate responsibilities:

- Parsing human input.
- Ensuring within bounds.
- Changing state.

---

## 13. Cancel a Booking

```fsharp
    let cancelBooking (layout:Layout) seatCode =
        match parseSeatCode seatCode with
        | Error e -> Error e
        | Ok (r,c) ->
            match validateSeat layout (r,c) with
            | Error e -> Error e
            | Ok () ->
                match layout.[r,c] with
                | Available -> Error "Seat is not booked"
                | Booked _ ->
                    setAvailable layout r c
                    Ok ()
```

Purpose: Cancel a booking given a seat code string.

Flow:

1. Parse the seat code into `(r, c)`.
2. Validate the indices `(r, c)`.
3. Inspect the current seat status:
   - If `Available`:
     - Return `Error "Seat is not booked"` (nothing to cancel).
   - If `Booked _`:
     - Call `setAvailable layout r c` to free the seat.
     - Return `Ok ()`.

**F# concept:** Pattern matching with multiple levels and clear error propagation using `Result`.

---

## 14. Getting Status by Seat Code

```fsharp
    let getStatusByCode (layout:Layout) seatCode =
        match parseSeatCode seatCode with
        | Error e -> Error e
        | Ok (r,c) ->
            match validateSeat layout (r,c) with
            | Error e -> Error e
            | Ok () -> Ok (getStatus layout r c)
```

Purpose: Return the `SeatStatus` for a given seat code.

- Parse ? Validate ? If valid, call `getStatus layout r c` and wrap in `Ok`.
- Error cases propagate the message from parsing or validation.

Example outcomes:

- `Ok Available` – the seat is free.
- `Ok (Booked ticketId)` – the seat is booked.
- `Error "Invalid seat format"`, `Error "Row out of range"`, etc.

---

## 15. Displaying the Layout in the Console

```fsharp
    let displaySimple (layout:Layout) =
        let rows = Array2D.length1 layout
        let cols = Array2D.length2 layout
        printf "   "
        for c in 1 .. cols do printf "%2d " c
        printfn ""
        for r in 0 .. rows-1 do
            printf "%c  " (indexToRowChar r)
            for c in 0 .. cols-1 do
                let ch =
                    match layout.[r,c] with
                    | Available -> "O"
                    | Booked _ -> "X"
                printf "%2s " ch
            printfn ""
```

Purpose: Print a simple ASCII representation of the seating layout.

Behavior:

- Prints column headers (1..cols) at the top.
- For each row:
  - Prints row letter (A, B, C, ...).
  - For each seat in the row:
    - `"O"` for `Available`.
    - `"X"` for `Booked _`.
- Ends each row with `printfn ""` (newline).

Example layout (3 rows × 4 columns):

```text
     1  2  3  4 
A   O  O  X  O 
B   O  X  X  O 
C   O  O  O  O 
```

**F# / .NET concepts:**

- `printf` / `printfn` for formatted console output.
- Nested `for` loops over rows and columns.
- Pattern matching to select symbols.

---

## 16. Summary of Concepts Used

The `Seats` module demonstrates several core F# concepts:

- **Discriminated unions** (`SeatStatus`) to model domain states.
- **Type aliases** (`Layout`) to give readable names to complex types.
- **2D arrays (`Array2D`)** as a mutable grid structure.
- **Pattern matching** on union cases and results.
- **Result type** (`Ok` / `Error`) for explicit error handling.
- **Function composition**:
  - Parsing ? Validation ? Operation (book/cancel/get status).
- **String parsing and formatting** using `System.String`, `Int32.TryParse`, and `sprintf`/interpolation.

This module is the core domain logic your ASP.NET Core API uses in `Program.fs` to manage seats.
