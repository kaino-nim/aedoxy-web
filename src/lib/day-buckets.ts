/** Day buckets for the admin charts. Days are WIB (Asia/Jakarta, UTC+7, no DST) calendar days, written YYYY-MM-DD. */

const WIB_OFFSET_MS = 7 * 3_600_000;
const DAY_MS = 86_400_000;

/** The WIB calendar day of an instant. */
export function wibDay(at: Date): string {
  return new Date(at.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10);
}

/** The `days` WIB days ending with today (oldest first). */
export function lastDays(days: number, now = new Date()): string[] {
  const today = Date.parse(`${wibDay(now)}T00:00:00Z`);
  return Array.from({ length: days }, (_, i) => new Date(today - (days - 1 - i) * DAY_MS).toISOString().slice(0, 10));
}

/** UTC instant at which the oldest of the last `days` WIB days starts (the lower bound for the query). */
export function windowStart(days: number, now = new Date()): Date {
  return new Date(Date.parse(`${lastDays(days, now)[0]}T00:00:00Z`) - WIB_OFFSET_MS);
}

export type DayPoint = { date: string; count: number; amountIdr: number };

/** Puts grouped rows on every day of the window; days without rows are 0 and rows outside the window are ignored. */
export function fillDays(rows: { date: string; count: number; amountIdr?: number }[], days: number, now = new Date()): DayPoint[] {
  const byDay = new Map(rows.map((r) => [r.date, r]));
  return lastDays(days, now).map((date) => {
    const r = byDay.get(date);
    return { date, count: r?.count ?? 0, amountIdr: r?.amountIdr ?? 0 };
  });
}
