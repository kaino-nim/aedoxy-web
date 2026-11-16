import { describe, expect, it } from "vitest";
import { fillDays, lastDays, windowStart, wibDay } from "./day-buckets";

describe("wibDay", () => {
  it("rolls over at 17:00 UTC (00:00 WIB)", () => {
    expect(wibDay(new Date("2026-11-16T16:59:59Z"))).toBe("2026-11-16");
    expect(wibDay(new Date("2026-11-16T17:00:00Z"))).toBe("2026-11-17");
  });
});

describe("lastDays", () => {
  it("lists the window oldest first, ending with today in WIB", () => {
    expect(lastDays(3, new Date("2026-11-16T10:00:00Z"))).toEqual(["2026-11-14", "2026-11-15", "2026-11-16"]);
  });
  it("crosses month and year boundaries", () => {
    expect(lastDays(3, new Date("2027-01-01T01:00:00Z"))).toEqual(["2026-12-30", "2026-12-31", "2027-01-01"]);
    expect(lastDays(2, new Date("2026-03-01T00:00:00Z"))).toEqual(["2026-02-28", "2026-03-01"]);
  });
});

describe("windowStart", () => {
  it("is midnight WIB of the oldest day, as a UTC instant", () => {
    expect(windowStart(3, new Date("2026-11-16T10:00:00Z")).toISOString()).toBe("2026-11-13T17:00:00.000Z");
  });
});

describe("fillDays", () => {
  const now = new Date("2026-11-16T10:00:00Z");
  it("fills empty days with 0 and keeps given values", () => {
    expect(fillDays([{ date: "2026-11-15", count: 2, amountIdr: 50_000 }], 3, now)).toEqual([
      { date: "2026-11-14", count: 0, amountIdr: 0 },
      { date: "2026-11-15", count: 2, amountIdr: 50_000 },
      { date: "2026-11-16", count: 0, amountIdr: 0 },
    ]);
  });
  it("ignores rows outside the window and handles no rows", () => {
    expect(fillDays([{ date: "2025-01-01", count: 9 }], 2, now).every((p) => p.count === 0)).toBe(true);
    expect(fillDays([], 30, now)).toHaveLength(30);
  });
});
