

open System


type SeatStatus = 
    | Available
    | Booked of ticketId:string

module SeatLayout =
    type Layout = SeatStatus [,]

    let createLayout rows cols =
        Array2D.init rows cols (fun _ _ -> Available)

    let rowCharToIndex (ch:char) = int (System.Char.ToUpper ch) - int 'A'
    let indexToRowChar (i:int) = char (int 'A' + i)

    let inBounds rows cols r c =
        r >= 0 && r < rows && c >= 0 && c < cols

    let isSeatAvailable (layout:Layout) r c =
        match layout.[r,c] with
        | Available -> true
        | Booked _ -> false

    let getStatus (layout:Layout) r c =
        layout.[r,c]

    let setAvailable (layout:Layout) r c =
        layout.[r,c] <- Available


    //  "A3" -> (rowIndex , colIndex)-> (A,2)
    let parseSeatCode (seat:string) =
        if String.IsNullOrWhiteSpace seat || seat.Length < 2 then
            Error "Invalid seat format"
        else
            let rowChar = System.Char.ToUpper seat.[0]
            let row = rowCharToIndex rowChar
            let colStr = seat.Substring(1)
            match System.Int32.TryParse colStr with
            | true, col -> Ok (row, col - 1)
            | _ -> Error "Column must be a number"

    let validateSeat (layout:Layout) (r,c) =
        let rows = Array2D.length1 layout
        let cols = Array2D.length2 layout
        if r < 0 || r >= rows then Error "Row out of range"
        elif c < 0 || c >= cols then Error "Column out of range"
        else Ok ()
    // a function to generate a unique ticket ID
    let generateTicketId () =
        let now = System.DateTime.Now
        let stamp = now.ToString("yyyyMMdd-HHmmss")
        let rnd = System.Random().Next(100,999)
        $"T-{stamp}-{rnd}"
    
    // first version of tryBookSeat
    let tryBookSeat (layout:Layout) r c =
        if not (inBounds (Array2D.length1 layout) (Array2D.length2 layout) r c) then
            Error "out of bounds"
        else
            match layout.[r,c] with
            | Available ->
                let ticketId = generateTicketId()   // ← توليد ID تلقائي
                layout.[r,c] <- Booked ticketId
                Ok ticketId                         // ← رجّع ID
            | Booked _ -> Error "already booked"

    // book by seat code like "A3" using previous functions
    let bookByCode (layout:Layout) (seatCode:string) =
        match parseSeatCode seatCode with
        | Error e -> Error e
        | Ok (r,c) ->
            match validateSeat layout (r,c) with
            | Error e -> Error e
            | Ok () ->
                tryBookSeat layout r c

    // cancel booking by seat code like "A3"
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

    // get status by seat code like "A3"
    let getStatusByCode (layout:Layout) seatCode =
        match parseSeatCode seatCode with
        | Error e -> Error e
        | Ok (r,c) ->
            match validateSeat layout (r,c) with
            | Error e -> Error e
            | Ok () -> Ok (getStatus layout r c)



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





// test .fs (جزء)
open System
open SeatLayout

[<EntryPoint>]
let main argv =
    
    // 1) إنشاء السينما
    let layout = createLayout 5 7   // 5 صفوف × 5 أعمدة

    printfn "Initial Layout:"
    displaySimple layout

    // input loop to book seats
    let rec inputLoop layout =
        printf "Enter seat code: "
        let code = Console.ReadLine()

        if code = "exit" then
            printfn "Bye!"
        else
            match bookByCode layout code with
            | Ok id ->
                printfn "Seat %s booked. Ticket = %s" code id
                displaySimple layout
                inputLoop layout
            | Error e ->
                printfn "Error: %s" e
                inputLoop layout

     //Uncomment to enable interactive booking
    //inputLoop layout
    0



//  test cancel booking /////////
        
    // book seat A3 first
    match bookByCode layout "A3" with
    | Ok id -> printfn "Booked A3 with ticket %s" id
    | Error e -> printfn "Booking failed: %s" e
    displaySimple layout


    // try cancel
    match cancelBooking layout "A3" with
    | Ok () -> printfn "A3 cancelled successfully!"
    | Error e -> printfn "Cancel error: %s" e
    displaySimple layout

    // cancel again → should show error
    match cancelBooking layout "A3" with
    | Ok () -> printfn "Unexpected: cancel should fail"
    | Error e -> printfn "Correct: second cancel failed (%s)" e

    // display layout
    displaySimple layout
    0

        
        


