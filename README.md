# 🎬 Cinema Seat Reservation System (Frontend)

A modern, fully-functional cinema seat reservation system built with **Next.js**, **TailwindCSS**, and **shadcn/ui**. Users can select seats, confirm bookings, and download tickets as text or JSON files.

## ✨ Features

### 🎯 Core Functionality

- **Interactive Seating Map**: 6 rows × 10 seats grid with real-time updates
- **Seat Selection**: Click to select/deselect available seats with smooth animations
- **Booked Seat Management**: Visual distinction for unavailable seats
- **Ticket Generation**: Unique ticket IDs with booking confirmation
- **Ticket Download**: Save tickets as `.txt` or `.json` files
- **Persistent Storage**: localStorage saves booking state across sessions
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

### 🎨 UI/UX Enhancements

- Dark mode support
- Smooth hover and click animations
- Visual feedback for seat states (available, selected, booked)
- Clean, minimal cinema-themed interface
- Intuitive booking workflow

## 📦 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Styling**: [TailwindCSS 4](https://tailwindcss.com)
- **Components**: [shadcn/ui](https://ui.shadcn.com) (Button, Dialog, Card)
- **UI Icons**: [Lucide React](https://lucide.dev)
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📁 Project Structure

```
Cinema Seat Reservation System (Frontend Only)/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Top navigation with booking stats
│   │   │   ├── SeatGrid.tsx        # Main seating chart display
│   │   │   ├── Seat.tsx            # Individual seat component
│   │   │   └── TicketDialog.tsx    # Confirmation & download dialog
│   │   ├── hooks/
│   │   │   └── useSeatBooking.ts   # Custom hook for booking logic
│   │   ├── layout.tsx              # Root layout with metadata
│   │   ├── page.tsx                # Main reservation page
│   │   └── globals.css             # Global TailwindCSS styles
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx          # shadcn/ui Button
│   │       ├── dialog.tsx          # shadcn/ui Dialog
│   │       └── card.tsx            # shadcn/ui Card
│   └── lib/
│       ├── utils.ts                # Utility functions (cn, tailwind-merge)
│       └── generateTicketId.ts     # Ticket generation & formatting utilities
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or higher
- pnpm (recommended) or npm/yarn

### Installation

1. **Navigate to the project directory**:

   ```bash
   cd "Cinema Seat Reservation System (Frontend Only)"
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Run the development server**:

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000) in your web browser.

## 🎮 Usage

### Booking a Seat

1. **Browse Seats**: View the seating chart with:

   - 🟩 **White/Light**: Available seats
   - 🟦 **Blue**: Currently selected seats
   - 🟪 **Gray**: Already booked seats

2. **Select Seats**: Click on available seats to select them

   - Selected seats are highlighted in blue
   - Hover over seats for smooth scale animation
   - Cannot select booked seats

3. **Review Selection**: Check the booking summary on the right panel

   - Shows selected seat labels (e.g., A1, A2, B5)
   - Displays total ticket price ($12 per seat)
   - Real-time update counter

4. **Confirm Booking**:

   - Click **"Confirm Booking"** button
   - A ticket confirmation dialog appears
   - Displays unique ticket ID and booking details

5. **Download Ticket**:
   - **Download Ticket**: Save as `.txt` file (human-readable)
   - **Download JSON**: Save as `.json` file (structured data)
   - **Copy Ticket ID**: Click copy button for quick reference

## 🔑 Key Features Explained

### Seat Selection Logic

- **useSeatBooking Hook**: Manages selected/booked seats with localStorage persistence
- **Real-time Updates**: Changes reflect immediately across all components
- **State Persistence**: Closing and reopening the app preserves booking state

### Ticket Generation

- **Unique ID Format**: `TICKET-YYYYMMDD-HHMMSS-XXXXX`
- **Seat Labels**: Automatic conversion (seat 0 → A1, seat 10 → B1, etc.)
- **Multiple Formats**: Download as plain text or JSON

### Components

#### `Navbar.tsx`

- Displays cinema title with logo
- Shows live counters for selected and booked seats
- Sticky positioning for easy access

#### `SeatGrid.tsx`

- 6 rows × 10 seats (configurable in `page.tsx`)
- Visual legend explaining seat states
- Screen indicator at the top
- Row labels (A-F) on both sides

#### `Seat.tsx`

- Individual seat button component
- States: available, selected, booked
- Accessibility features (ARIA labels, title attributes)
- Hover animations and focus management

#### `TicketDialog.tsx`

- Confirmation dialog with booking details
- Unique ticket ID display with copy button
- Seat breakdown and price summary
- Download options (TXT and JSON)

### Hooks

#### `useSeatBooking.ts`

```typescript
{
  selectedSeats, // Array of currently selected seat numbers
    bookedSeats, // Array of permanently booked seat numbers
    toggleSeat, // Function to select/deselect a seat
    confirmBooking, // Function to confirm and lock in booking
    clearSelection, // Function to clear selected seats
    resetBookings, // Function to reset all bookings to default
    isLoaded; // Boolean indicating if localStorage is loaded
}
```

## 📝 Customization

### Change Seating Configuration

Edit `src/app/page.tsx`:

```typescript
const CINEMA_ROWS = 6; // Change number of rows
const SEATS_PER_ROW = 10; // Change seats per row
const CINEMA_NAME = "Cineplex Theatre"; // Change cinema name
const MOVIE_TITLE = "The Blockbuster Movie"; // Change movie title
```

### Change Ticket Price

In `src/app/page.tsx`, find the price display:

```typescript
<p className="text-2xl font-bold text-gray-900 dark:text-white">
  ${selectedSeats.length * 12} {/* Change 12 to your price */}
</p>
```

### Modify Default Booked Seats

In `src/app/hooks/useSeatBooking.ts`:

```typescript
const DEFAULT_BOOKED_SEATS = [2, 3, 5, 8, 10, 15, 18, 20, 25];
// Modify this array to change which seats are pre-booked
```

## 🎨 Styling & Dark Mode

The application supports dark mode through TailwindCSS. All components use the `dark:` prefix for dark mode styles.

To test dark mode:

- In browser DevTools: Toggle `html` element class `dark`
- Or set system preference to dark mode

## 📥 Downloading Tickets

### Text Format (`.txt`)

```
===========================================
         CINEMA TICKET CONFIRMATION
===========================================

Ticket ID: TICKET-20251207-143025-ABC12
Cinema: Cineplex Theatre
Movie: The Blockbuster Movie
Date: December 7, 2025, 2:30 PM

SEATS BOOKED:
A1, A2, B5, C3

Total Seats: 4

===========================================
```

### JSON Format (`.json`)

```json
{
  "ticketId": "TICKET-20251207-143025-ABC12",
  "cinema": "Cineplex Theatre",
  "movie": "The Blockbuster Movie",
  "seatsBooked": ["A1", "A2", "B5", "C3"],
  "totalSeats": 4,
  "bookingDate": "2025-12-07T14:30:25.123Z",
  "bookingTime": "December 7, 2025, 2:30 PM"
}
```

## 🔄 Data Persistence

### localStorage Structure

```javascript
{
  "cinema_seat_booking": {
    "selectedSeats": [0, 5, 12],
    "bookedSeats": [2, 3, 5, 8, 10, 15, 18, 20, 25]
  }
}
```

Data automatically saves to localStorage when:

- Seats are selected/deselected
- Booking is confirmed
- Application state changes

## 🧪 Testing

### Manual Testing

1. **Seat Selection**: Click available seats and verify selection
2. **Booked Seats**: Verify booked seats cannot be clicked
3. **Persistence**: Refresh page and verify selections remain
4. **Ticket Download**: Confirm both TXT and JSON downloads work
5. **Dark Mode**: Toggle dark mode and verify styles

### Reset for Testing

- Click **"Reset All"** button to clear all bookings
- localStorage will be cleared
- Default booked seats will be restored

## 📱 Responsive Design

- **Mobile**: Single column layout, optimized touch targets
- **Tablet**: Two-column layout with smaller components
- **Desktop**: Full three-column layout with sidebar summary

## 🚀 Production Build

To create an optimized production build:

```bash
pnpm build
pnpm start
# or
npm run build
npm start
```

Build output is in the `.next` directory.

## 📊 Performance

- **Next.js 16 with Turbopack**: Ultra-fast build and reload times
- **TailwindCSS v4**: Minimal CSS output (~25KB gzipped)
- **Client-side Rendering**: No server latency for interactions
- **localStorage**: Instant data persistence without network calls

## 🐛 Known Limitations & Future Enhancements

### Current Limitations

- Frontend-only (no backend integration)
- No payment processing
- No user authentication
- Booked seats are hardcoded (not dynamic from server)

### Potential Enhancements

- ✅ Backend API integration for real booking system
- ✅ Payment gateway integration (Stripe, PayPal)
- ✅ User authentication and accounts
- ✅ Email ticket delivery
- ✅ Multiple movies/showtimes selection
- ✅ Dynamic pricing based on seat location
- ✅ Group booking discounts
- ✅ Seat categories (premium, standard, economy)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork and submit pull requests for improvements!

---

**Built with ❤️ using Next.js, TailwindCSS, and shadcn/ui**This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
