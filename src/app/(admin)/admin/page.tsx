import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Card, Stat } from "@/components/admin/common";
import { DayBarChart, PoolBar } from "@/components/admin/day-bar-chart";
import { PixelIcon } from "@/components/admin/pixel-icon";
import { PageHeader } from "@/components/console/page-header";
import { StatsPageSkeleton } from "@/components/console/skeletons";
import { formatIdr, formatUsd, QUOTA_PER_USD } from "@/lib/format";
import { requireAdmin } from "@/server/admin";
import { CHART_DAYS, getAdminOverview, getAdminSeries } from "@/server/domain/admin-overview";

export const metadata: Metadata = { title: "Ringkasan" };

export default function AdminHomePage() {
  return (
    <Suspense fallback={<StatsPageSkeleton stats={6} />}>
      <Overview />
    </Suspense>
  );
}

const usd = (quota: number) => formatUsd(quota / QUOTA_PER_USD);

async function Overview() {
  await requireAdmin();
  const [o, series] = await Promise.all([getAdminOverview(), getAdminSeries()]);
  const inv = o.invariant;
  const paidTotal = series.paidOrders.reduce((s, p) => s + p.count, 0);
  const paidAmount = series.paidOrders.reduce((s, p) => s + p.amountIdr, 0);
  const newUsersTotal = series.newUsers.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Ringkasan" description="Kondisi pool, order, dan fulfillment dalam sekali lihat." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat icon={<PixelIcon name="pool" />} label="Pool tersedia" value={o.pool ? usd(o.pool.available) : "-"} hint={o.pool ? `Terjual ${usd(o.pool.sold)} · direservasi ${usd(o.pool.reserved)}` : "Pool belum dibuat (jalankan db:seed-catalog)"} tone={o.pool && o.pool.available < 0 ? "danger" : undefined} />
        <Stat icon={<PixelIcon name="coin" />} label="Pool total" value={o.pool ? usd(o.pool.total) : "-"} hint={<Link href="/admin/pool" className="text-primary-ink underline-offset-4 hover:underline">Kelola stok</Link>} />
        <Stat
          icon={<PixelIcon name="order" />}
          label="Order 24 jam"
          value={o.ordersTotal24h}
          hint={`Lunas ${o.orders24h.paid ?? 0} · menunggu ${o.orders24h.pending ?? 0} · kedaluwarsa ${o.orders24h.expired ?? 0} · gagal ${o.orders24h.failed ?? 0}`}
        />
        <Stat
          icon={<PixelIcon name="alert" />}
          label="Fulfillment gagal"
          value={o.deadFulfillments}
          tone={o.deadFulfillments > 0 ? "danger" : "success"}
          hint={o.deadFulfillments > 0 ? <Link href="/admin/orders?fulfillment=dead" className="text-primary-ink underline-offset-4 hover:underline">Lihat order tertahan</Link> : "Tidak ada yang tertahan"}
        />
        <Stat
          icon={<PixelIcon name="shield" />}
          label="Invarian pool"
          value={!inv ? "-" : inv.ok ? "Cocok" : "Selisih"}
          tone={inv && !inv.ok ? "danger" : "success"}
          hint={!inv ? "Pool belum dibuat" : inv.ok ? "Kolom pool sama dengan ledger" : "Kolom pool tidak sama dengan ledger, perlu diperiksa"}
        />
        <Stat icon={<PixelIcon name="user" />} label={`Pengguna baru ${CHART_DAYS} hari`} value={newUsersTotal} hint={`Pembelian lunas ${paidTotal} · ${formatIdr(paidAmount)}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="py-5">
          <h2 className="text-base font-medium text-heading">Pembelian paket per hari</h2>
          <p className="mt-1 mb-4 text-sm text-fg-muted">Order lunas {CHART_DAYS} hari terakhir, per hari WIB.</p>
          <DayBarChart points={series.paidOrders} title="Pembelian paket per hari" unit="order lunas" showAmount />
        </Card>
        <Card className="py-5">
          <h2 className="text-base font-medium text-heading">Pengguna baru per hari</h2>
          <p className="mt-1 mb-4 text-sm text-fg-muted">Akun terdaftar {CHART_DAYS} hari terakhir, per hari WIB.</p>
          <DayBarChart points={series.newUsers} title="Pengguna baru per hari" unit="akun baru" />
        </Card>
      </div>

      {o.pool && (
        <Card className="py-5">
          <h2 className="text-base font-medium text-heading">Stok pool kredit</h2>
          <p className="mt-1 mb-4 text-sm text-fg-muted">Sisa, direservasi, dan terjual dari total {usd(o.pool.total)}.</p>
          <PoolBar
            parts={[
              { label: "Tersedia", value: o.pool.available, text: usd(o.pool.available), className: "bg-primary" },
              { label: "Direservasi", value: o.pool.reserved, text: usd(o.pool.reserved), className: "bg-accent" },
              { label: "Terjual", value: o.pool.sold, text: usd(o.pool.sold), className: "bg-fg-muted" },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
