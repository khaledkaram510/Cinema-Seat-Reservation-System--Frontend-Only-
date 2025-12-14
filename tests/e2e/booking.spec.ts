import fs from "node:fs/promises";
import path from "node:path";

import {
  expect,
  test,
  type APIRequestContext,
  type Page,
  type TestInfo,
} from "@playwright/test";

const SELECTORS = {
  seat: (label: string) => ({ role: "button", name: `Seat ${label}` as const }),
  confirmBookingButton: { role: "button", name: /Confirm Booking/ },
  confirmDialogConfirm: { role: "button", name: /^Confirm$/ },
  ticketDialogTitle: { role: "heading", name: /Booking Confirmed/i },
  ticketDownload: { role: "button", name: /Download Ticket/i },
  ticketClose: { role: "button", name: /^Close$/ },
};

const TICKETS_DIR = path.join(process.cwd(), "tickets");
const API_BASE = process.env.PLAYWRIGHT_API_BASE || "http://localhost:8080";
const USER_PAUSE_MS = 350;

const safeName = (value: string) => value.replace(/[^a-z0-9-]+/gi, "-");

async function captureStep(page: Page, testInfo: TestInfo, label: string) {
  const fileName = `${safeName(testInfo.title)}-${safeName(label)}.png`;
  await page.screenshot({
    path: testInfo.outputPath(fileName),
    fullPage: true,
  });
  await page.waitForTimeout(USER_PAUSE_MS);
}

async function closeTicketDialog(page: Page) {
  const dialog = page.getByRole("dialog", { name: /Booking Confirmed/i });
  await dialog.getByRole("button", SELECTORS.ticketClose).first().click();
}

async function ensureSeatAvailable(
  request: APIRequestContext,
  seatCode: string
) {
  const seatRes = await request.get(`${API_BASE}/seats/${seatCode}`);
  expect(seatRes.ok()).toBeTruthy();
  const seat = await seatRes.json();
  if (
    typeof seat.status === "string" &&
    seat.status.toLowerCase() === "booked" &&
    seat.ticket
  ) {
    const cancelRes = await request.delete(`${API_BASE}/book/${seat.ticket}`);
    expect(cancelRes.ok()).toBeTruthy();
  }
}

async function bookSeatIfAvailable(
  request: APIRequestContext,
  seatCode: string,
  username: string,
  email: string
) {
  const seatRes = await request.get(`${API_BASE}/seats/${seatCode}`);
  expect(seatRes.ok()).toBeTruthy();
  const seat = await seatRes.json();

  if (
    typeof seat.status === "string" &&
    seat.status.toLowerCase() === "available"
  ) {
    const bookRes = await request.post(`${API_BASE}/book`, {
      headers: { "Content-Type": "application/json" },
      data: { seatCode, username, email },
    });
    expect(bookRes.ok()).toBeTruthy();
    return bookRes;
  }

  return null;
}

test.describe("Cinema seat booking", () => {
  test.beforeAll(async () => {
    await fs.mkdir(TICKETS_DIR, { recursive: true });
  });

  test.beforeEach(async ({ page, request }) => {
    await ensureSeatAvailable(request, "A4");
    await ensureSeatAvailable(request, "B2");
    await page.goto("/");
    await expect(page.getByRole("button", SELECTORS.seat("A4"))).toBeVisible();
  });

  test("books seat A4 and saves ticket to tickets folder", async ({
    page,
  }, testInfo) => {
    await captureStep(page, testInfo, "initial-page");

    await page.getByRole("button", SELECTORS.seat("A4")).click();
    await captureStep(page, testInfo, "seat-a4-selected");

    await page.getByRole("button", SELECTORS.confirmBookingButton).click();
    await expect(
      page.getByRole("heading", { name: /Confirm Booking/i })
    ).toBeVisible();
    await captureStep(page, testInfo, "confirm-dialog-open");

    await page.getByRole("button", SELECTORS.confirmDialogConfirm).click();

    await expect(
      page.getByRole("heading", SELECTORS.ticketDialogTitle)
    ).toBeVisible();
    await captureStep(page, testInfo, "ticket-dialog-open");
    const ticketCode = page.locator("code").first();
    const codeText = await ticketCode.textContent();
    expect(codeText?.trim().length).toBeGreaterThan(0);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", SELECTORS.ticketDownload).click();
    const download = await downloadPromise;
    const targetPath = path.join(TICKETS_DIR, download.suggestedFilename());
    await download.saveAs(targetPath);
    const saved = await fs.stat(targetPath);
    expect(saved.size).toBeGreaterThan(0);

    await closeTicketDialog(page);
    await captureStep(page, testInfo, "ticket-dialog-closed");
    const bookedSeatA4 = page.getByRole("button", SELECTORS.seat("A4"));
    await expect(bookedSeatA4).toBeEnabled();
    await expect(bookedSeatA4).toHaveClass(/bg-app-green-500/);
    await captureStep(page, testInfo, "seat-a4-booked");
  });

  test("supports multiple users booking A4 and B2 concurrently", async ({
    browser,
    request,
  }, testInfo) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

    await ensureSeatAvailable(request, "A4");
    await ensureSeatAvailable(request, "B2");

    const userContexts = await Promise.all([
      browser.newContext({ baseURL, acceptDownloads: true }),
      browser.newContext({ baseURL, acceptDownloads: true }),
    ]);

    const [userOne, userTwo] = await Promise.all(
      userContexts.map(async (context, index) => {
        const newPage = await context.newPage();
        await newPage.goto("/");
        await captureStep(newPage, testInfo, `user${index + 1}-initial`);
        return newPage;
      })
    );

    // User one books A4
    await userOne.getByRole("button", SELECTORS.seat("A4")).click();
    await captureStep(userOne, testInfo, "user1-seat-a4-selected");
    await userOne.getByRole("button", SELECTORS.confirmBookingButton).click();
    await expect(
      userOne.getByRole("heading", { name: /Confirm Booking/i })
    ).toBeVisible();
    await captureStep(userOne, testInfo, "user1-confirm-dialog-open");
    await userOne.getByRole("button", SELECTORS.confirmDialogConfirm).click();
    await expect(
      userOne.getByRole("heading", SELECTORS.ticketDialogTitle)
    ).toBeVisible();
    await captureStep(userOne, testInfo, "user1-ticket-dialog-open");
    const userOneDownloadPromise = userOne.waitForEvent("download");
    await userOne.getByRole("button", SELECTORS.ticketDownload).click();
    const userOneDownload = await userOneDownloadPromise;
    const userOneTarget = path.join(
      TICKETS_DIR,
      userOneDownload.suggestedFilename()
    );
    await userOneDownload.saveAs(userOneTarget);
    const userOneSaved = await fs.stat(userOneTarget);
    expect(userOneSaved.size).toBeGreaterThan(0);
    await closeTicketDialog(userOne);
    await captureStep(userOne, testInfo, "user1-ticket-dialog-closed");
    const userOneSeatA4 = userOne.getByRole("button", SELECTORS.seat("A4"));
    await expect(userOneSeatA4).toBeEnabled();
    await expect(userOneSeatA4).toHaveClass(/bg-app-green-500/);
    await captureStep(userOne, testInfo, "user1-seat-a4-booked");

    // User two books B2
    await userTwo.getByRole("button", SELECTORS.seat("B2")).click();
    await captureStep(userTwo, testInfo, "user2-seat-b2-selected");
    await userTwo.getByRole("button", SELECTORS.confirmBookingButton).click();
    await expect(
      userTwo.getByRole("heading", { name: /Confirm Booking/i })
    ).toBeVisible();
    await captureStep(userTwo, testInfo, "user2-confirm-dialog-open");
    await userTwo.getByRole("button", SELECTORS.confirmDialogConfirm).click();
    await expect(
      userTwo.getByRole("heading", SELECTORS.ticketDialogTitle)
    ).toBeVisible();
    await captureStep(userTwo, testInfo, "user2-ticket-dialog-open");
    const userTwoDownloadPromise = userTwo.waitForEvent("download");
    await userTwo.getByRole("button", SELECTORS.ticketDownload).click();
    const userTwoDownload = await userTwoDownloadPromise;
    const userTwoTarget = path.join(
      TICKETS_DIR,
      userTwoDownload.suggestedFilename()
    );
    await userTwoDownload.saveAs(userTwoTarget);
    const userTwoSaved = await fs.stat(userTwoTarget);
    expect(userTwoSaved.size).toBeGreaterThan(0);
    await closeTicketDialog(userTwo);
    await captureStep(userTwo, testInfo, "user2-ticket-dialog-closed");
    const userTwoSeatB2 = userTwo.getByRole("button", SELECTORS.seat("B2"));
    await expect(userTwoSeatB2).toBeEnabled();
    await expect(userTwoSeatB2).toHaveClass(/bg-app-green-500/);
    await captureStep(userTwo, testInfo, "user2-seat-b2-booked");

    await Promise.all(userContexts.map((context) => context.close()));
  });
});

test.describe("Single user flows", () => {
  test.beforeAll(async ({ request }) => {
    // Seed a booked seat by another user to validate double-book prevention
    await bookSeatIfAvailable(request, "F3", "seed-user", "seed@example.com");
  });

  test.beforeEach(async ({ request }) => {
    await ensureSeatAvailable(request, "C1");
    await ensureSeatAvailable(request, "C2");
  });

  test.afterEach(async ({ request }) => {
    await ensureSeatAvailable(request, "C1");
    await ensureSeatAvailable(request, "C2");
  });

  test("user can book a ticket", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("button", SELECTORS.seat("C1"))).toBeVisible();
    await captureStep(page, testInfo, "initial-page");

    await page.getByRole("button", SELECTORS.seat("C1")).click();
    await captureStep(page, testInfo, "seat-c1-selected");
    await page.getByRole("button", SELECTORS.confirmBookingButton).click();
    await expect(
      page.getByRole("heading", { name: /Confirm Booking/i })
    ).toBeVisible();
    await captureStep(page, testInfo, "confirm-dialog-open");
    await page.getByRole("button", SELECTORS.confirmDialogConfirm).click();

    await expect(
      page.getByRole("heading", SELECTORS.ticketDialogTitle)
    ).toBeVisible();
    await captureStep(page, testInfo, "ticket-dialog-open");
    await closeTicketDialog(page);
    await captureStep(page, testInfo, "ticket-dialog-closed");
    const bookedSeatC1 = page.getByRole("button", SELECTORS.seat("C1"));
    await expect(bookedSeatC1).toBeEnabled();
    await expect(bookedSeatC1).toHaveClass(/bg-app-green-500/);
    await captureStep(page, testInfo, "seat-c1-booked");
  });

  test("user cannot book an already booked ticket", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("button", SELECTORS.seat("F3"))).toBeDisabled();
    await captureStep(page, testInfo, "booked-seat-disabled");
  });

  test("user cancels their booked ticket", async ({
    page,
    request,
  }, testInfo) => {
    await page.goto("/");
    await captureStep(page, testInfo, "initial-page");
    await page.getByRole("button", SELECTORS.seat("C2")).click();
    await captureStep(page, testInfo, "seat-c2-selected");
    await page.getByRole("button", SELECTORS.confirmBookingButton).click();
    await expect(
      page.getByRole("heading", { name: /Confirm Booking/i })
    ).toBeVisible();
    await captureStep(page, testInfo, "confirm-dialog-open");
    await page.getByRole("button", SELECTORS.confirmDialogConfirm).click();

    const ticketCodeText = await page.locator("code").first().textContent();
    const ticketCode = ticketCodeText?.trim();
    expect(ticketCode && ticketCode.length > 0).toBeTruthy();

    await expect(
      page.getByRole("heading", SELECTORS.ticketDialogTitle)
    ).toBeVisible();
    await captureStep(page, testInfo, "ticket-dialog-open");

    if (ticketCode) {
      const cancelRes = await request.delete(`${API_BASE}/book/${ticketCode}`);
      expect(cancelRes.ok()).toBeTruthy();
    }

    await closeTicketDialog(page);
    await captureStep(page, testInfo, "ticket-dialog-closed");

    await page.reload();
    await expect(page.getByRole("button", SELECTORS.seat("C2"))).toBeEnabled();
    await captureStep(page, testInfo, "seat-c2-available-after-cancel");
  });
});
