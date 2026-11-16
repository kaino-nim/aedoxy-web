import type { FxRate } from "@/server/catalog/types";
import { formatIdr, formatUsd } from "./format";

/**
 * USD -> IDR for display only (F04 / TRD D7). Never use this for an order
 * amount: the buyer always pays the flat plan price.
 */
export function usdToIdr(usd: number, fx: FxRate): number {
  const step = fx.roundingStepIdr > 0 ? fx.roundingStepIdr : 1;
  return Math.round((usd * fx.rate) / step) * step;
}

export type Currency = "usd" | "idr";

/**
 * One USD amount in the chosen display currency, for every price column of the model catalogue (provider list
 * price and credit cost alike). IDR needs a rate with conversion switched on, otherwise USD is shown. An amount
 * that rounds to Rp0 shows as "< Rp<step>" instead of a misleading zero.
 */
export function formatPrice(usd: number, currency: Currency, fx: FxRate | null): string {
  if (currency !== "idr" || !fx || !fx.showConversion) return formatUsd(usd);
  const idr = usdToIdr(usd, fx);
  if (idr === 0 && usd > 0) return `< ${formatIdr(fx.roundingStepIdr > 0 ? fx.roundingStepIdr : 1)}`;
  return formatIdr(idr);
}

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "Kurs Rp18.148 / $1, ECB (Frankfurter), 30 Okt 2026" */
export function fxNote(fx: FxRate): string {
  return `Kurs ${formatIdr(fx.rate)} / $1, ${fx.source}, ${dateFmt.format(new Date(fx.sourceDate))}`;
}
