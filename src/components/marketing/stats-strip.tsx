import { Crown, Tag } from "lucide-react";
import { ProviderLogo } from "@/components/brand/provider-logo";
import { Badge } from "@/components/ui/badge";
import { formatIdr, formatTokens } from "@/lib/format";
import { cheapestPlan, PERIOD_LABEL } from "@/lib/plans";
import type { Model, Plan, Provider, Stats } from "@/server/catalog/types";

interface StatBlock {
  label: string;
  value: string;
  /** Small coloured unit after the number. */
  unit?: string;
  note: string;
  visual?: React.ReactNode;
}

const PILL = "inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-tint px-3 py-1.5 font-mono text-xs text-primary-ink";

/** Mini bar chart, one bar per provider, height = that provider's model count. Decorative; the numbers are in the provider list below. */
function ModelBars({ counts }: { counts: number[] }) {
  const max = Math.max(...counts);
  return (
    <div aria-hidden className="flex h-7 items-end gap-1">
      {counts.map((c, i) => (
        <span key={i} className="w-2.5 rounded-[2px] bg-primary" style={{ height: `${Math.max(14, (c / max) * 100)}%`, opacity: 0.4 + 0.6 * (c / max) }} />
      ))}
    </div>
  );
}

/** Blocks without data are left out, never filled with made-up numbers (UI-GUIDE section 4). Counts of 0 hide their block. */
function buildBlocks(stats: Stats, models: Model[], providers: Provider[], plans: Plan[]): StatBlock[] {
  const perProvider = new Map<string, number>();
  for (const m of models) perProvider.set(m.providerId, (perProvider.get(m.providerId) ?? 0) + 1);
  const counts = [...perProvider.values()].sort((a, b) => a - b);
  const capabilities = [...new Set(models.flatMap((m) => m.capabilities))];
  const top = providers.reduce<{ name: string; n: number } | null>((best, p) => {
    const n = perProvider.get(p.id) ?? 0;
    return n > 0 && (best === null || n > best.n) ? { name: p.name, n } : best;
  }, null);
  const cheapest = cheapestPlan(plans);
  const periods = [...new Set(plans.map((p) => p.period))];

  const blocks: StatBlock[] = [];
  if (stats.models > 0) {
    blocks.push({
      label: "Model tersedia",
      value: String(stats.models),
      unit: "model",
      note: "dari lab besar dan model terbuka",
      visual: (
        <div className="flex flex-col gap-3">
          {counts.length > 1 && <ModelBars counts={counts} />}
          {capabilities.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {capabilities.map((c) => (
                <li key={c}>
                  <Badge variant="outline" className="font-mono font-normal text-fg-soft">
                    {c}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    });
  }
  if (stats.providers > 0) {
    blocks.push({
      label: "Provider",
      value: String(stats.providers),
      unit: "provider",
      note: "dalam satu katalog dan satu API key",
      visual: (
        <div className="flex flex-col gap-3">
          <span aria-hidden className="flex items-center">
            {providers.slice(0, 6).map((p) => (
              <span key={p.id} className="grid size-8 place-items-center rounded-full border border-line bg-surface not-first:-ml-2">
                <ProviderLogo id={p.id} name={p.name} size={16} />
              </span>
            ))}
          </span>
          {top && (
            <span className={PILL}>
              <Crown className="size-3.5" aria-hidden />
              {top.name} · {top.n} model
            </span>
          )}
        </div>
      ),
    });
  }
  if (stats.plans > 0) {
    blocks.push({
      label: "Paket langganan",
      value: String(stats.plans),
      unit: "paket",
      note: "harga flat dalam rupiah",
      visual: (
        <div className="flex flex-col gap-3">
          {cheapest && (
            <span className={PILL}>
              <Tag className="size-3.5" aria-hidden />
              mulai {formatIdr(cheapest.priceIdr)}
            </span>
          )}
          <ul className="flex flex-wrap gap-1.5">
            {periods.map((p) => (
              <li key={p}>
                <Badge variant="outline" className="font-mono font-normal text-fg-soft">
                  {PERIOD_LABEL[p]}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ),
    });
  }
  if (stats.tokensProcessed !== undefined) {
    blocks.push({ label: "Token diproses", value: formatTokens(stats.tokensProcessed), note: "dipotong dari kredit paket" });
  }
  if (stats.developers !== undefined) {
    blocks.push({ label: "Developer", value: String(stats.developers), note: "memakai satu API key" });
  }
  return blocks;
}

/** Real counts as columns (big number, one visual each). The provider marquee is its own full-bleed section after this one. */
export function StatsStrip({ stats, models, providers, plans }: { stats: Stats; models: Model[]; providers: Provider[]; plans: Plan[] }) {
  const blocks = buildBlocks(stats, models, providers, plans);
  if (blocks.length === 0) return null;

  return (
    <section aria-label="Ringkasan layanan">
      <div className="container-x flex flex-col gap-12 pt-12 pb-10 sm:pt-16 sm:pb-12">
        {blocks.length > 0 && (
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
            {blocks.map((b) => (
              <div key={b.label} data-rise className="flex min-w-0 flex-col">
                <dt className="font-mono text-xs tracking-[0.12em] text-fg-muted uppercase">{b.label}</dt>
                <dd className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-[64px] leading-none font-medium tracking-[-0.05em] text-heading tabular-nums sm:text-[80px]">{b.value}</span>
                  {b.unit && <span className="font-mono text-lg font-medium text-primary-ink">{b.unit}</span>}
                </dd>
                {b.visual && <dd className="mt-5 min-h-[4.5rem]">{b.visual}</dd>}
                <dd className="mt-4 text-sm text-fg-muted">{b.note}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
