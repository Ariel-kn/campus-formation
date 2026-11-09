import { describe, expect, it } from "vitest";
import { isDeadlineWithinReminderWindow } from "./deadlineReminders";

describe("rappels d’échéance", () => {
  const now = new Date("2026-08-17T09:00:00.000Z");

  it("retient les échéances comprises entre maintenant et trois jours", () => {
    expect(isDeadlineWithinReminderWindow(new Date("2026-08-17T09:00:00.000Z"), now)).toBe(true);
    expect(isDeadlineWithinReminderWindow(new Date("2026-08-20T09:00:00.000Z"), now)).toBe(true);
  });

  it("écarte les échéances dépassées ou encore trop éloignées", () => {
    expect(isDeadlineWithinReminderWindow(new Date("2026-08-17T08:59:59.000Z"), now)).toBe(false);
    expect(isDeadlineWithinReminderWindow(new Date("2026-08-20T10:00:00.000Z"), now)).toBe(false);
  });
});
