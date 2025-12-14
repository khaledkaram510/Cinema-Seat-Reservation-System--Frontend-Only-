import { expect, test } from "@playwright/test";

const SELECTORS = {
  seat: (label: string) => ({ role: "button", name: `Seat ${label}` as const }),
  confirmBookingButton: { role: "button", name: /Confirm Booking/ },
  confirmDialogConfirm: { role: "button", name: /^Confirm$/ },
  ticketDialogTitle: { role: "heading", name: /Booking Confirmed/i },
  ticketDownload: { role: "button", name: /Download Ticket/i },
  ticketClose: { role: "button", name: /^Close$/ },
};

test.describe("Cinema seat booking", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", SELECTORS.seat("A1"))).toBeVisible();
  });

  test("renders seating layout and shows booked seats as disabled", async ({
    page,
  }) => {
    await expect(page.getByRole("button", SELECTORS.seat("A4"))).toBeDisabled();
    await expect(page.getByRole("button", SELECTORS.seat("B2"))).toBeDisabled();
  });

  test("completes a booking and displays a ticket id with downloadable ticket", async ({
    page,
  }) => {
    await page.getByRole("button", SELECTORS.seat("A1")).click();
    await page.getByRole("button", SELECTORS.confirmBookingButton).click();

    await expect(
      page.getByRole("heading", { name: /Confirm Booking/i })
    ).toBeVisible();
    await page.getByRole("button", SELECTORS.confirmDialogConfirm).click();

    await expect(
      page.getByRole("heading", SELECTORS.ticketDialogTitle)
    ).toBeVisible();
    const ticketCode = page.locator("code").first();
    const codeText = await ticketCode.textContent();
    expect(codeText?.trim().length).toBeGreaterThan(0);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", SELECTORS.ticketDownload).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("ticket-");
  });

  test("prevents double booking after confirmation", async ({ page }) => {
    await page.getByRole("button", SELECTORS.seat("A1")).click();
    await page.getByRole("button", SELECTORS.confirmBookingButton).click();
    await page.getByRole("button", SELECTORS.confirmDialogConfirm).click();

    await expect(
      page.getByRole("heading", SELECTORS.ticketDialogTitle)
    ).toBeVisible();
    await page.getByRole("button", SELECTORS.ticketClose).click();

    const seat = page.getByRole("button", SELECTORS.seat("A1"));
    await expect(seat).toBeDisabled();
  });
});
