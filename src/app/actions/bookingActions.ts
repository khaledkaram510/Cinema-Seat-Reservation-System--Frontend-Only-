"use server";

import { revalidatePath } from "next/cache";
import { generateTicketId } from "@/lib/generateTicketId";

export type BookingActionState = {
  success: boolean;
  message: string;
  data?: unknown;
};

export async function handleFormAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const useMock =
    process.env.NEXT_PUBLIC_USE_API_MOCK === "true" ||
    process.env.USE_API_MOCK === "true";

  try {
    console.log(formData);
    const email = formData.get("email");
    const name = formData.get("name");
    const seats = formData.get("seats");

    if (useMock) {
      const ticket = generateTicketId();
      const data = {
        seats: [
          {
            ticketId: ticket,
            seatNumber: -1,
            seatTitle: (seats as string) || "",
          },
        ],
        name,
        email,
      };
      return {
        success: true,
        message: "Booking successful!",
        data,
      };
    }

    const response = await fetch("http://localhost:8080/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seatCode: seats,
        username: name,
        email: email,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Booking failed. Please try again.",
      };
    }

    const result = await response.json();
    console.log(result);
    const data = {
      seats: [
        {
          ticketId: result.ticket,
          seatNumber: -1,
          seatTitle: seats as string,
        },
      ],
      name,
      email,
      // bookingTime: result.bookingTime,
    };
    revalidatePath("/");
    return {
      success: true,
      message: "Booking successful!",
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
