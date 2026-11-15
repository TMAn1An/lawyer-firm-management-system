import { describe, expect, it } from "vitest";
import { addDays, canTransition, checkCapacity, freeSlots, isValidDateString, isWorkingDay, todayInDhaka, validateSchedule, SLOTS } from "./rules";

describe("dates", () => {
  it("validates calendar dates strictly", () => {
    expect(isValidDateString("2026-02-28")).toBe(true);
    expect(isValidDateString("2026-02-30")).toBe(false);
    expect(isValidDateString("26-2-3")).toBe(false);
  });
  it("treats Friday and Saturday as the weekend", () => {
    expect(isWorkingDay("2026-11-15")).toBe(true); // Sunday
    expect(isWorkingDay("2026-11-19")).toBe(true); // Thursday
    expect(isWorkingDay("2026-11-20")).toBe(false); // Friday
    expect(isWorkingDay("2026-11-21")).toBe(false); // Saturday
  });
  it("uses Bangladesh time for 'today'", () => {
    // 20:00 UTC is already the next day in Dhaka (UTC+6)
    expect(todayInDhaka(new Date("2026-11-15T20:00:00Z"))).toBe("2026-11-16");
    expect(todayInDhaka(new Date("2026-11-15T10:00:00Z"))).toBe("2026-11-15");
  });
  it("adds days across month ends", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });
});

describe("validateSchedule", () => {
  const today = "2026-11-15";
  it("accepts a working day within range", () => expect(validateSchedule("2026-11-16", "10:00", today)).toBeNull());
  it("rejects the past", () => expect(validateSchedule("2026-11-14", "10:00", today)).toBe("PAST_DATE"));
  it("rejects weekends", () => expect(validateSchedule("2026-11-20", "10:00", today)).toBe("NOT_WORKING_DAY"));
  it("rejects too far ahead", () => expect(validateSchedule("2027-03-01", "10:00", today)).toBe("TOO_FAR"));
  it("rejects slots outside office hours", () => {
    expect(validateSchedule("2026-11-16", "13:00", today)).toBe("INVALID_SLOT");
    expect(validateSchedule("2026-11-16", "22:00", today)).toBe("INVALID_SLOT");
  });
  it("rejects garbage dates", () => expect(validateSchedule("tomorrow", "10:00", today)).toBe("INVALID_DATE"));
});

describe("capacity", () => {
  it("prevents double booking", () => expect(checkCapacity(["10:00"], "10:00", 8)).toBe("SLOT_TAKEN"));
  it("stops at the daily cap", () => expect(checkCapacity(["09:00", "10:00"], "11:00", 2)).toBe("DAY_FULL"));
  it("allows a free slot under the cap", () => expect(checkCapacity(["09:00"], "10:00", 8)).toBeNull());
  it("lists free slots", () => {
    expect(freeSlots(["09:00"], 8)).toHaveLength(SLOTS.length - 1);
    expect(freeSlots(["09:00", "10:00"], 2)).toEqual([]);
  });
});

describe("status transitions", () => {
  it("allows the normal flow", () => {
    expect(canTransition("SUBMITTED", "CONFIRMED")).toBe(true);
    expect(canTransition("CONFIRMED", "COMPLETED")).toBe(true);
  });
  it("blocks rewinding finished requests", () => {
    expect(canTransition("COMPLETED", "SUBMITTED")).toBe(false);
    expect(canTransition("CANCELLED", "CONFIRMED")).toBe(false);
    expect(canTransition("SUBMITTED", "COMPLETED")).toBe(false);
  });
});
