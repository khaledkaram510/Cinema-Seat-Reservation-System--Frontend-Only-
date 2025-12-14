# Test Cases – Cinema Seat Reservation System

## Scope

Covers UI flows for loading the seat map, selecting seats, preventing double booking, confirming a booking, ticket generation, and downloads. Assumes mock API mode (`NEXT_PUBLIC_USE_API_MOCK=true` / `USE_API_MOCK=true`) during automation to avoid backend dependency.

## Manual Test Cases

1. **Layout renders**

   - Steps: Load home page.
   - Expected: Seating grid appears with legend; booked seats are disabled.

2. **Select available seat**

   - Steps: Click an available seat (e.g., A1).
   - Expected: Seat turns blue; booking summary shows the seat; confirm button enabled with count.

3. **Prevent selecting booked seat**

   - Steps: Click a booked seat (e.g., A4 from mock layout).
   - Expected: Click ignored; seat remains gray/disabled; no selection added.

4. **Confirm booking flow**

   - Steps: Select a seat, click "Confirm Booking", submit the dialog.
   - Expected: Ticket dialog opens with non-empty ticket ID and selected seats listed.

5. **Download ticket (TXT)**

   - Steps: From ticket dialog, click "Download Ticket".
   - Expected: File download starts with name pattern `ticket-<id>.txt`.

6. **Download ticket (JSON)**

   - Steps: From ticket dialog, click "Download JSON".
   - Expected: File download starts with name pattern `ticket-<id>.json`.

7. **Copy ticket ID**

   - Steps: Click copy icon in ticket dialog.
   - Expected: Clipboard receives ticket ID; UI shows success check icon briefly.

8. **Persist and disable after booking**

   - Steps: Close ticket dialog; attempt to click same seat again.
   - Expected: Seat is booked/disabled and cannot be re-selected (double booking prevented).

9. **Cancel my booking** (if backend available)

   - Steps: Select a seat you previously booked (green), click "Cancel Booking".
   - Expected: Seat returns to available state after confirmation and refresh.

10. **Error handling** (with backend down)
    - Steps: Disable mock mode, load page without backend.
    - Expected: Mock layout fallback keeps the UI usable; no crash.

## Automated (Playwright) Coverage

- Implemented in [tests/e2e/booking.spec.ts](tests/e2e/booking.spec.ts):
  - Layout renders and booked seats are disabled.
  - Booking flow produces a non-empty ticket ID and triggers download.
  - Double booking prevention after confirmation.

## Test Data (mock mode)

- Mock layout: 3 rows × 4 seats; booked seats: A4, B2.
- Price: $12 per seat (from UI summary).
- Generated ticket IDs follow `TICKET-YYYYMMDD-HHMMSS-XXXXX`.

## How to Run

```bash
# Install deps (once)
pnpm install

# Install Playwright browsers
pnpm exec playwright install --with-deps

# Run e2e tests in headless mode with mock API
env NEXT_PUBLIC_USE_API_MOCK=true USE_API_MOCK=true pnpm test:e2e

# Debug/headed
env NEXT_PUBLIC_USE_API_MOCK=true USE_API_MOCK=true pnpm test:e2e:headed

# Interactive UI runner (Playwright UI)
env NEXT_PUBLIC_USE_API_MOCK=true USE_API_MOCK=true pnpm test:e2e:ui
```
