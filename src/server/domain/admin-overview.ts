import { count, eq, gte, sql, sum, type SQL } from "drizzle-orm";
import { fillDays, windowStart } from "@/lib/day-buckets";
import { db } from "@/server/db/client";
import { creditPool, fulfillments, orders, user } from "@/server/db/schema";
import { checkPoolInvariant } from "./pool-invariant";

/** Numbers for /admin. Read-only; the invariant check does not write an audit row here. */
export async function getAdminOverview(now = new Date()) {
  const since = new Date(now.getTime() - 24 * 3_600_000);
  const [[pool], byStatus, [dead], invariant] = await Promise.all([
    db.select().from(creditPool).where(eq(creditPool.id, 1)),
    db.select({ status: orders.status, n: count() }).from(orders).where(gte(orders.createdAt, since)).groupBy(orders.status),
    db.select({ n: count() }).from(fulfillments).where(eq(fulfillments.status, "dead")),
    checkPoolInvariant({ record: false }),
  ]);
  const orders24h: Record<string, number> = {};
  for (const r of byStatus) orders24h[r.status] = r.n;
  return {
    pool: pool
      ? { total: pool.totalQuota, reserved: pool.reservedQuota, sold: pool.soldQuota, available: pool.totalQuota - pool.reservedQuota - pool.soldQuota }
      : null,
    orders24h,
    ordersTotal24h: byStatus.reduce((sum, r) => sum + r.n, 0),
    deadFulfillments: dead.n,
    invariant,
  };
}

export const CHART_DAYS = 30;

/** WIB calendar day of a timestamp column, as YYYY-MM-DD, for GROUP BY. */
const wibDaySql = (col: SQL | { name: string }) => sql<string>`to_char((${col}) at time zone 'Asia/Jakarta', 'YYYY-MM-DD')`;

/**
 * Daily series for the /admin charts over the last CHART_DAYS WIB days (empty days are 0): paid orders (count and rupiah
 * actually paid) by paid_at, and new accounts by created_at. Two grouped queries, no per-row reads, no personal data.
 */
export async function getAdminSeries(now = new Date()) {
  const from = windowStart(CHART_DAYS, now);
  const paidDay = wibDaySql(orders.paidAt);
  const userDay = wibDaySql(user.createdAt);
  const [paid, signups] = await Promise.all([
    db
      .select({ date: paidDay, count: count(), amountIdr: sum(orders.amountIdr) })
      .from(orders)
      .where(sql`${orders.status} = 'paid' and ${orders.paidAt} >= ${from}`)
      .groupBy(paidDay),
    db.select({ date: userDay, count: count() }).from(user).where(gte(user.createdAt, from)).groupBy(userDay),
  ]);
  return {
    paidOrders: fillDays(paid.map((r) => ({ date: r.date, count: r.count, amountIdr: Number(r.amountIdr ?? 0) })), CHART_DAYS, now),
    newUsers: fillDays(signups, CHART_DAYS, now),
  };
}
