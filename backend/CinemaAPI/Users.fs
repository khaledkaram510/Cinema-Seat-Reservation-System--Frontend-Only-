namespace Cinema

module Users =
    type User = { id: int; name: string }
    let getSampleUser () = { id = 1; name = "Alice" }
