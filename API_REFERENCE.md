# Cinema Seat Reservation System - Code Examples & API Reference

## 📚 Table of Contents

1. [Component API Reference](#component-api-reference)
2. [Hook API Reference](#hook-api-reference)
3. [Utility Functions](#utility-functions)
4. [Integration Examples](#integration-examples)
5. [Type Definitions](#type-definitions)
6. [Advanced Usage](#advanced-usage)

---

## 🧩 Component API Reference

### Navbar Component

#### Component Signature

```typescript
interface NavbarProps {
  selectedSeatsCount: number;
  bookedSeatsCount: number;
}

export function Navbar(props: NavbarProps): React.ReactNode;
```

#### Basic Usage

```tsx
import { Navbar } from "./components/Navbar";

export default function Page() {
  return (
    <>
      <Navbar selectedSeatsCount={3} bookedSeatsCount={9} />
      {/* Rest of page */}
    </>
  );
}
```

#### Advanced Usage with Props

```tsx
function DynamicNavbar() {
  const [selected, setSelected] = useState(0);
  const [booked, setBooked] = useState(0);

  return <Navbar selectedSeatsCount={selected} bookedSeatsCount={booked} />;
}
```

#### Styling

- **Container**: `sticky top-0 z-40 border-b border-gray-200`
- **Logo**: Blue gradient background `from-blue-600 to-blue-700`
- **Text**: Responsive heading with subtext
- **Dark Mode**: Automatically applied via Tailwind

---

### SeatGrid Component

#### Component Signature

```typescript
interface SeatGridProps {
  rows: number;
  seatsPerRow: number;
  selectedSeats: number[];
  bookedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
}

export function SeatGrid(props: SeatGridProps): React.ReactNode;
```

#### Complete Example

```tsx
import { SeatGrid } from "./components/SeatGrid";
import { useState } from "react";

export default function Cinema() {
  const [selected, setSelected] = useState<number[]>([]);
  const [booked] = useState<number[]>([2, 3, 5]);

  const handleToggleSeat = (seatNumber: number) => {
    setSelected((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  return (
    <SeatGrid
      rows={6}
      seatsPerRow={10}
      selectedSeats={selected}
      bookedSeats={booked}
      onToggleSeat={handleToggleSeat}
    />
  );
}
```

#### Props Explanation

**`rows: number`**

- Number of rows in the grid (A, B, C, etc.)
- Range: 1-26 (limited by alphabet)
- Type: positive integer
- Example: `rows={6}` creates 6 rows (A through F)

**`seatsPerRow: number`**

- Seats in each row
- Range: 1-20 (responsive design limits)
- Type: positive integer
- Example: `seatsPerRow={10}` creates 10 columns

**`selectedSeats: number[]`**

- Array of seat indices currently selected
- Index calculation: `rowIndex * seatsPerRow + columnIndex`
- Example: `[0, 5, 12]` selects seats at positions 0, 5, 12

**`bookedSeats: number[]`**

- Array of permanently booked seats (disabled)
- Same indexing as selectedSeats
- Example: `[2, 3, 8]` marks seats as unavailable

**`onToggleSeat: (seatNumber: number) => void`**

- Callback when user clicks a seat
- Called with seat index
- Not called for booked seats
- Example: `onToggleSeat={(num) => updateSeats(num)}`

#### Output Structure

```
┌─ SeatGrid
├─ Screen Indicator (visual element)
├─ Row A: [A1] [A2] [A3] ... [A10]
├─ Row B: [B1] [B2] [B3] ... [B10]
├─ Row C: [C1] [C2] [C3] ... [C10]
├─ Row D: [D1] [D2] [D3] ... [D10]
├─ Row E: [E1] [E2] [E3] ... [E10]
├─ Row F: [F1] [F2] [F3] ... [F10]
└─ Legend (color/state reference)
```

---

### Seat Component

#### Component Signature

```typescript
interface SeatProps {
  seatNumber: number;
  isSelected: boolean;
  isBooked: boolean;
  onToggle: (seatNumber: number) => void;
  rowLabel: string;
  colNumber: number;
}

export function Seat(props: SeatProps): React.ReactNode;
```

#### Individual Seat Example

```tsx
import { Seat } from "./components/Seat";

function SeatExample() {
  return (
    <Seat
      seatNumber={0} // Index in full grid
      isSelected={false} // Currently selected?
      isBooked={false} // Already booked?
      onToggle={(num) => handleSeatClick(num)}
      rowLabel="A" // Row label
      colNumber={1} // Column number (1-based)
    />
  );
}
```

#### Visual States

**Available Seat**

```
┌──────┐
│      │  Border: 2px gray-300
│  1   │  Background: white
│      │  Text: gray-400 (small)
└──────┘  Cursor: pointer
          Hover: blue-50 background
```

**Selected Seat**

```
┌──────┐
│      │  Border: 2px blue-500
│  1   │  Background: blue-500
│      │  Text: white
└──────┘  Cursor: pointer
          Shadow: lg drop-shadow
```

**Booked Seat**

```
┌──────┐
│      │  Border: 2px gray-400
│  1   │  Background: gray-300
│      │  Text: gray-600
└──────┘  Cursor: not-allowed
          Disabled: true
```

#### Props Details

**`seatNumber: number`**

- Unique index in the seating grid
- Used in onClick handler
- Calculated: `rowIndex * seatsPerRow + colIndex`

**`rowLabel: string`**

- Single letter (A-Z) for display
- Visual reference for user
- Example: "A", "B", "C"

**`colNumber: number`**

- 1-based column number
- Shown inside seat button
- Range: 1 to seatsPerRow

---

### TicketDialog Component

#### Component Signature

```typescript
interface TicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  selectedSeats: number[];
  seatsPerRow: number;
  cinemaName?: string;
  movieTitle?: string;
}

export function TicketDialog(props: TicketDialogProps): React.ReactNode;
```

#### Full Implementation Example

```tsx
import { TicketDialog } from "./components/TicketDialog";
import { generateTicketId } from "@/lib/generateTicketId";
import { useState } from "react";

export default function BookingFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const handleConfirmBooking = () => {
    const newTicketId = generateTicketId();
    setTicketId(newTicketId);
    setIsOpen(true);
    // Confirm booking in backend/storage
  };

  return (
    <>
      <button onClick={handleConfirmBooking}>Confirm Booking</button>

      <TicketDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ticketId={ticketId}
        selectedSeats={selectedSeats}
        seatsPerRow={10}
        cinemaName="Cineplex Theatre"
        movieTitle="The Blockbuster Movie"
      />
    </>
  );
}
```

#### Dialog Content Sections

**Ticket ID Display**

```
┌─────────────────────────────────────┐
│ Ticket ID                           │
├─────────────────────────────────────┤
│ TICKET-20251207-143025-ABC12 [COPY] │
└─────────────────────────────────────┘
```

**Booking Details**

```
┌─────────────────────────────────────┐
│ Booking Details                     │
├─────────────────────────────────────┤
│ Cinema: Cineplex Theatre            │
│ Movie: The Blockbuster Movie        │
│ Date: December 7, 2025, 2:30 PM    │
│ Seats: 4                            │
└─────────────────────────────────────┘
```

**Seats Breakdown**

```
┌─────────────────────────────────────┐
│ Seats Booked                        │
├─────────────────────────────────────┤
│ [A1] [A2] [B5] [C3]                │
└─────────────────────────────────────┘
```

**Action Buttons**

```
[Close] [Download JSON] [Download Ticket]
```

---

## 🪝 Hook API Reference

### useSeatBooking Hook

#### Hook Signature

```typescript
interface SeatBookingState {
  selectedSeats: number[];
  bookedSeats: number[];
}

interface useSeatBooking {
  selectedSeats: number[];
  bookedSeats: number[];
  toggleSeat: (seatNumber: number) => void;
  confirmBooking: () => void;
  clearSelection: () => void;
  resetBookings: () => void;
  isLoaded: boolean;
}

export function useSeatBooking(): useSeatBooking;
```

#### Basic Usage

```tsx
"use client";

import { useSeatBooking } from "@/app/hooks/useSeatBooking";

export default function Booking() {
  const {
    selectedSeats,
    bookedSeats,
    toggleSeat,
    confirmBooking,
    clearSelection,
    resetBookings,
    isLoaded,
  } = useSeatBooking();

  if (!isLoaded) {
    return <div>Loading booking data...</div>;
  }

  return (
    <>
      <p>Selected: {selectedSeats.length}</p>
      <p>Booked: {bookedSeats.length}</p>

      <button onClick={() => toggleSeat(0)}>Select Seat 0</button>
      <button onClick={confirmBooking}>Confirm Booking</button>
      <button onClick={clearSelection}>Clear Selection</button>
      <button onClick={resetBookings}>Reset All</button>
    </>
  );
}
```

#### Return Value Details

**`selectedSeats: number[]`**

- Current user selections (not yet confirmed)
- Cleared when confirmBooking() is called
- Persisted to localStorage
- User can modify (toggle/clear)
- Type: Array of seat indices

**`bookedSeats: number[]`**

- Permanently locked seat reservations
- Includes initial defaults + confirmed bookings
- Cannot be selected
- Persisted to localStorage
- Type: Array of seat indices

**`toggleSeat(seatNumber): void`**

- Adds or removes seat from selectedSeats
- No effect if seat is already booked
- Triggers localStorage update
- Returns: undefined

**`confirmBooking(): void`**

- Moves selectedSeats to bookedSeats
- Clears selectedSeats array
- Persists to localStorage
- Called after user confirms
- Returns: undefined

**`clearSelection(): void`**

- Empties selectedSeats array
- Leaves bookedSeats untouched
- Persists to localStorage
- Returns: undefined

**`resetBookings(): void`**

- Restores DEFAULT_BOOKED_SEATS
- Clears selectedSeats
- Removes localStorage entry
- Returns: undefined

**`isLoaded: boolean`**

- Indicates if localStorage has been read
- Wait for this before rendering
- Prevents hydration mismatch
- True after component mount

#### State Management Flow

```
Initial State
  ↓
isLoaded = false (reading localStorage)
  ↓
Data loaded from localStorage
  ↓
isLoaded = true
  ↓
User selects seats → selectedSeats updated
  ↓
User confirms → toggleSeat moves to bookedSeats
  ↓
State persisted to localStorage
```

#### localStorage Data Structure

```javascript
{
  "cinema_seat_booking": {
    "selectedSeats": [0, 5, 12],      // User's current selection
    "bookedSeats": [2, 3, 5, 8, 10]   // Confirmed reservations
  }
}
```

---

## 🛠️ Utility Functions

### generateTicketId()

#### Function Signature

```typescript
export function generateTicketId(): string;
```

#### Format

```
TICKET-YYYYMMDD-HHMMSS-XXXXX

Where:
- TICKET: Static prefix
- YYYYMMDD: Date in 8 digits (20251207)
- HHMMSS: Time in 6 digits (143025)
- XXXXX: Random 5-character alphanumeric suffix
```

#### Examples

```typescript
generateTicketId();
// Returns: "TICKET-20251207-143025-ABC12"
// Each call returns unique ID
```

#### Implementation Details

- Uses `Date` object for timestamp
- Random suffix from `Math.random().toString(36)`
- Always 28 characters long
- URL-safe characters only
- Guaranteed unique (statistically)

---

### seatNumberToLabel(seatNumber, seatsPerRow)

#### Function Signature

```typescript
export function seatNumberToLabel(
  seatNumber: number,
  seatsPerRow: number
): string;
```

#### Conversion Formula

```
rowIndex = Math.floor(seatNumber / seatsPerRow)
colIndex = seatNumber % seatsPerRow
rowLabel = String.fromCharCode(65 + rowIndex)  // A, B, C, etc.
seatLabel = colIndex + 1

Result: `${rowLabel}${seatLabel}`
```

#### Examples

```typescript
// With seatsPerRow = 10

seatNumberToLabel(0, 10); // "A1"  (row 0, col 1)
seatNumberToLabel(5, 10); // "A6"  (row 0, col 6)
seatNumberToLabel(10, 10); // "B1"  (row 1, col 1)
seatNumberToLabel(25, 10); // "C6"  (row 2, col 6)
seatNumberToLabel(55, 10); // "F6"  (row 5, col 6)

// With seatsPerRow = 12

seatNumberToLabel(0, 12); // "A1"
seatNumberToLabel(12, 12); // "B1"
seatNumberToLabel(24, 12); // "C1"
```

---

### formatSeats(seatNumbers, seatsPerRow)

#### Function Signature

```typescript
export function formatSeats(
  seatNumbers: number[],
  seatsPerRow: number
): string[];
```

#### Implementation

```typescript
// Calls seatNumberToLabel for each seat
return seatNumbers.map((num) => seatNumberToLabel(num, seatsPerRow));
```

#### Examples

```typescript
formatSeats([0, 5, 12], 10);
// Returns: ["A1", "A6", "B3"]

formatSeats([2, 3, 8, 10], 10);
// Returns: ["A3", "A4", "A9", "B1"]

formatSeats([], 10);
// Returns: []
```

---

### formatDate(date)

#### Function Signature

```typescript
export function formatDate(date: Date): string;
```

#### Locale

- Locale: English US (en-US)
- Format: Full date with 2-digit time
- Example: "December 7, 2025, 2:30 PM"

#### Examples

```typescript
const date = new Date(2025, 11, 7, 14, 30, 25);
formatDate(date);
// Returns: "December 7, 2025, 2:30 PM"

formatDate(new Date());
// Returns: Current date/time formatted
```

---

### downloadFile(content, filename)

#### Function Signature

```typescript
export function downloadFile(content: string, filename: string): void;
```

#### Implementation Details

1. Creates temporary `<a>` element
2. Sets `href` to data URI
3. Sets `download` attribute with filename
4. Appends to DOM
5. Triggers click
6. Removes element

#### MIME Types

- Text files: `text/plain;charset=utf-8`
- Encoding: UTF-8

#### Examples

```typescript
// Download text ticket
downloadFile(
  "TICKET CONFIRMATION\nTicket ID: ABC123\nSeats: A1, A2",
  "ticket-ABC123.txt"
);

// Download JSON data
downloadFile(
  JSON.stringify({ id: "ABC123", seats: ["A1", "A2"] }, null, 2),
  "ticket-ABC123.json"
);
```

#### Browser Compatibility

- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support

---

## 📋 Integration Examples

### Example 1: Complete Booking Flow

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "./components/Navbar";
import { SeatGrid } from "./components/SeatGrid";
import { TicketDialog } from "./components/TicketDialog";
import { useSeatBooking } from "./hooks/useSeatBooking";
import { generateTicketId } from "@/lib/generateTicketId";

const CINEMA_ROWS = 6;
const SEATS_PER_ROW = 10;
const PRICE_PER_SEAT = 12;

export default function CompleteFlow() {
  const {
    selectedSeats,
    bookedSeats,
    toggleSeat,
    confirmBooking,
    clearSelection,
    isLoaded,
  } = useSeatBooking();

  const [showDialog, setShowDialog] = useState(false);
  const [ticketId, setTicketId] = useState("");

  if (!isLoaded) return <LoadingSpinner />;

  const handleConfirm = () => {
    const id = generateTicketId();
    setTicketId(id);
    setShowDialog(true);
    confirmBooking();
  };

  const totalPrice = selectedSeats.length * PRICE_PER_SEAT;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar
        selectedSeatsCount={selectedSeats.length}
        bookedSeatsCount={bookedSeats.length}
      />

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
          {/* Seating */}
          <div className="col-span-2">
            <SeatGrid
              rows={CINEMA_ROWS}
              seatsPerRow={SEATS_PER_ROW}
              selectedSeats={selectedSeats}
              bookedSeats={bookedSeats}
              onToggleSeat={toggleSeat}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-bold mb-4">Booking Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Seats Selected:</span>
                  <span className="font-bold">{selectedSeats.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per Seat:</span>
                  <span>${PRICE_PER_SEAT}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${totalPrice}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleConfirm}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Confirm Booking
                </Button>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  disabled={selectedSeats.length === 0}
                  className="w-full"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Ticket Dialog */}
      {ticketId && (
        <TicketDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          ticketId={ticketId}
          selectedSeats={selectedSeats}
          seatsPerRow={SEATS_PER_ROW}
          cinemaName="Cineplex Theatre"
          movieTitle="The Blockbuster Movie"
        />
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
}
```

---

### Example 2: Multi-Show Booking

```tsx
'use client'

import { useState } from 'react'
import { SeatGrid } from './components/SeatGrid'
import { useSeatBooking } from './hooks/useSeatBooking'

const SHOWS = [
  { id: 1, time: '2:00 PM', rows: 6, seats: 10 },
  { id: 2, time: '5:00 PM', rows: 8, seats: 12 },
  { id: 3, time: '8:00 PM', rows: 6, seats 10 }
]

export default function MultiShowBooking() {
  const [selectedShow, setSelectedShow] = useState(SHOWS[0])
  const {
    selectedSeats,
    bookedSeats,
    toggleSeat
  } = useSeatBooking()

  const currentShow = SHOWS.find(s => s.id === selectedShow.id)!

  return (
    <div>
      {/* Show Selector */}
      <div className="flex gap-4 mb-6">
        {SHOWS.map(show => (
          <button
            key={show.id}
            onClick={() => setSelectedShow(show)}
            className={`px-4 py-2 rounded ${
              selectedShow.id === show.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            {show.time}
          </button>
        ))}
      </div>

      {/* Seating for Selected Show */}
      <SeatGrid
        rows={currentShow.rows}
        seatsPerRow={currentShow.seats}
        selectedSeats={selectedSeats}
        bookedSeats={bookedSeats}
        onToggleSeat={toggleSeat}
      />
    </div>
  )
}
```

---

## 📘 Type Definitions

All TypeScript interfaces used in the project:

```typescript
// Component Props
interface NavbarProps {
  selectedSeatsCount: number;
  bookedSeatsCount: number;
}

interface SeatGridProps {
  rows: number;
  seatsPerRow: number;
  selectedSeats: number[];
  bookedSeats: number[];
  onToggleSeat: (seatNumber: number) => void;
}

interface SeatProps {
  seatNumber: number;
  isSelected: boolean;
  isBooked: boolean;
  onToggle: (seatNumber: number) => void;
  rowLabel: string;
  colNumber: number;
}

interface TicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  selectedSeats: number[];
  seatsPerRow: number;
  cinemaName?: string;
  movieTitle?: string;
}

// Hook Return Type
interface SeatBookingState {
  selectedSeats: number[];
  bookedSeats: number[];
  toggleSeat: (seatNumber: number) => void;
  confirmBooking: () => void;
  clearSelection: () => void;
  resetBookings: () => void;
  isLoaded: boolean;
}
```

---

## 🎓 Advanced Usage

### Custom Seat Renderer

Extend SeatGrid with custom seat rendering:

```tsx
interface CustomSeatGridProps extends SeatGridProps {
  customSeatRenderer?: (props: SeatProps) => React.ReactNode;
}

export function CustomSeatGrid({
  customSeatRenderer,
  ...props
}: CustomSeatGridProps) {
  return <div>{/* render seats with custom renderer if provided */}</div>;
}
```

### Booking Analytics

Track booking events:

```tsx
function useBookingAnalytics() {
  const trackSelection = (seatNumber: number) => {
    // Send analytics event
    console.log(`Seat ${seatNumber} selected`);
  };

  const trackConfirmation = (seats: number[]) => {
    // Send analytics event
    console.log(`Booking confirmed: ${seats.length} seats`);
  };

  return { trackSelection, trackConfirmation };
}
```

### Server-Side Integration (Future)

When backend is ready:

```tsx
async function confirmBooking(selectedSeats: number[]) {
  const response = await fetch("/api/bookings", {
    method: "POST",
    body: JSON.stringify({ seats: selectedSeats }),
  });

  const { ticketId } = await response.json();
  return ticketId;
}
```

---

**Last Updated**: December 2025
