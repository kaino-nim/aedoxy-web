import type { Metadata } from "next";
import { Suspense } from "react";
import { LedgerTable } from "@/components/admin/ledger-table";
import { Card, param, Stat, type SearchParams } from "@/components/admin/common";
import { AdjustPoolForm, ThresholdForm } from "@/components/admin/pool-forms";
import { PageHeader } from "@/components/console/page-header";
import { TablePageSkeleton } from "@/components/console/skeletons";
import { Button } from "@/components/ui/button";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/lib/table-query";
import { UsdIdr } from "@/components/usd-idr";
import { formatUsd, QUOTA_PER_USD } from "@/lib/format";
import { requireAdmin } from "@/server/admin";
import { getFxRate } from "@/server/catalog";
import { getPoolOverview, listLedger } from "@/server/domain/admin-pool";
import { DEFAULT_LOW_THRESHOLD_QUOTA } from "@/server/domain/pool-status";

export const metadata: Metadata = { title: "Pool" };

export default function PoolPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<TablePageSkeleton stats={6} filters cols={6} />}>
      <Pool searchParams={searchParams} />
    </Suspense>
  );
}

const num = new Intl.NumberFormat("id-ID");
const usd = (quota: number) => formatUsd(quota / QUOTA_PER_USD);
const both = (quota: number) => `${usd(quota)} (${num.format(quota)} kuota)`;

async function Pool({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = { type: param(sp.type), from: param(sp.from), to: param(sp.to) };
  const [overview, ledger, fx] = await Promise.all([getPoolOverview(), listLedger(filter, 1, DEFAULT_TABLE_PAGE_SIZE), getFxRate()]);

  const exportQuery = new URLSearchParams(Object.entries(filter).filter((e): e is [string, string] => Boolean(e[1]))).toString();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Pool kredit"
        description="Stok kredit yang dijual ke pembeli. Perubahan stok dicatat di ledger di bawah."
        actions={
          <Button asChild variant="outline" className="h-9 px-4 text-sm font-semibold">
            <a href={`/admin/pool/export${exportQuery ? `?${exportQuery}` : ""}`} download>
              Ekspor CSV
            </a>
          </Button>
        }
      />

      {!overview ? (
        <Card>
          <p className="text-sm text-fg-muted">Pool belum dibuat. Jalankan <code className="font-mono">bun run db:seed-catalog</code> sekali, lalu muat ulang halaman ini.</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Tersedia" value={usd(overview.available)} hint={<>{both(overview.available)} <UsdIdr quota={overview.available} fx={fx} /></>} tone={overview.available < 0 ? "danger" : undefined} />
            <Stat label="Total" value={usd(overview.total)} hint={<>{both(overview.total)} <UsdIdr quota={overview.total} fx={fx} /></>} />
            <Stat label="Terjual" value={usd(overview.sold)} hint={both(overview.sold)} />
            <Stat label="Direservasi" value={usd(overview.reserved)} hint={`${both(overview.reserved)} · order menunggu bayar`} />
            <Stat label="Terpakai" value={`${overview.usedPct}%`} hint="(terjual + direservasi) / total" />
            <Stat
              label="Invarian pool"
              value={!overview.invariant ? "-" : overview.invariant.ok ? "Cocok" : `Selisih ${num.format(diff(overview.invariant))}`}
              tone={overview.invariant && !overview.invariant.ok ? "danger" : "success"}
              hint={overview.invariant?.ok === false ? "Kolom pool tidak sama dengan ledger. Periksa sebelum mengubah stok." : "Kolom pool sama dengan jumlah ledger"}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AdjustPoolForm />
            <ThresholdForm
              currentUsd={overview.lowThreshold / QUOTA_PER_USD}
              effectiveText={usd(overview.lowThreshold > 0 ? overview.lowThreshold : DEFAULT_LOW_THRESHOLD_QUOTA)}
            />
          </div>
        </>
      )}

      <h2 className="pt-4 text-xl font-medium tracking-[-0.02em] text-heading">Ledger</h2>
      <LedgerTable
        initial={{ rows: ledger.rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })), total: ledger.total }}
        initialFilters={Object.fromEntries(Object.entries(filter).filter((e): e is [string, string] => Boolean(e[1])))}
      />
    </div>
  );
}

function diff(inv: NonNullable<Awaited<ReturnType<typeof getPoolOverview>>>["invariant"] & object) {
  return Math.abs(inv.pool.total - inv.ledger.total) + Math.abs(inv.pool.reserved - inv.ledger.reserved) + Math.abs(inv.pool.sold - inv.ledger.sold);
}
