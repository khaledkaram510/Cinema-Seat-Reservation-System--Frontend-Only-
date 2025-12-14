# Cinema Seat Reservation System – Documentation

## Overview

A Next.js front-end that renders a cinema seating map, lets users select seats, prevents double booking, generates ticket IDs, and lets users download their tickets (TXT/JSON). Mock mode is available to run without a backend.

## Architecture

- **Framework:** Next.js App Router (TS)
- **Styling:** TailwindCSS v4 + shadcn/ui
- **State:** Local component state + localStorage for user booking data
- **Key modules:**
  - [src/lib/utils.ts](src/lib/utils.ts): UI helpers, API calls with mock fallback
  - [src/lib/generateTicketId.ts](src/lib/generateTicketId.ts): Ticket ID and formatting utilities
  - [src/hooks/useSeatBooking.ts](src/hooks/useSeatBooking.ts): Booking state, selection, persistence, layout loading
  - [src/app/actions/bookingActions.ts](src/app/actions/bookingActions.ts): Server action for booking (mock-aware)
  - [src/app/Main.tsx](src/app/Main.tsx): Composition of layout, dialogs, and seat grid
  - [src/components/custom](src/components/custom): Seat grid, dialogs, navbar, footer

## Data Flow

1. **Layout load:** `getLayout()` fetches `/layout` or returns a mock layout when `NEXT_PUBLIC_USE_API_MOCK=true`.
2. **Seat rendering:** `SeatGrid` builds seat buttons (row-major). `bookedSeats` marks disabled seats; `bookedByMe` enables cancellation flow.
3. **Selection:** `useSeatBooking.toggleSeat` prevents selecting booked seats. `toggleDelSeat` handles cancellation selection for seats booked by the user.
4. **Booking:** `ConfirmBookingDialog` posts via server action `handleFormAction`. In mock mode it generates a ticket locally. On success, `setUserData` stores ticket + seat, `TicketDialog` opens.
5. **Double booking prevention:** `confirmBooking()` moves selected seats into `bookedSeats`; `refreshLayout()` re-syncs from the API/mock.
6. **Downloads:** `TicketDialog` exposes TXT/JSON downloads and copy-to-clipboard for the ticket ID.
7. **Cancellation:** `deleteSeat()` (mock-aware) removes tickets; state and localStorage are updated.

## Mock Mode

Enable to run without a backend:

```
NEXT_PUBLIC_USE_API_MOCK=true
USE_API_MOCK=true
```

- Layout: 3 rows × 4 seats; booked: A4, B2.
- Booking: Generates ticket ID locally.
- Delete: Always succeeds.

## Running the App

```bash
pnpm install
pnpm dev --port 3000
# visit http://localhost:3000
```

## Testing

- **Manual cases:** See [TEST_CASES.md](TEST_CASES.md).
- **Playwright e2e:** [tests/e2e/booking.spec.ts](tests/e2e/booking.spec.ts)

```bash
pnpm exec playwright install --with-deps
env NEXT_PUBLIC_USE_API_MOCK=true USE_API_MOCK=true pnpm test:e2e
# Interactive UI runner
env NEXT_PUBLIC_USE_API_MOCK=true USE_API_MOCK=true pnpm test:e2e:ui
```

## Ticket Format

- ID: `TICKET-YYYYMMDD-HHMMSS-XXXXX`
- Downloads: `ticket-<id>.txt` and `ticket-<id>.json`

## Team Roles Mapping

- Seat Layout Architect: `getLayout` structure and mock layout
- Display Developer: `SeatGrid`, `Seat`
- Booking Logic Developer: `useSeatBooking`
- Ticket System Developer: `generateTicketId`, `TicketDialog`
- File Storage Developer: localStorage handling in `useSeatBooking`
- UI Developer: `Main`, `Navbar`, dialogs, Tailwind/shadcn styling
- Tester: Playwright e2e and manual cases
- Documentation Lead: This document and TEST_CASES.md
