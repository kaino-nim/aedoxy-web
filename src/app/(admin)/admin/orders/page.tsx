import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";
import { param, type SearchParams } from "@/components/admin/common";
import { PageHeader } from "@/components/console/page-header";
import { TablePageSkeleton } from "@/components/console/skeletons";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/lib/table-query";
import { requireAdmin } from "@/server/admin";
import { listAdminOrders } from "@/server/domain/admin-orders";

export const metadata: Metadata = { title: "Order" };

export default function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<TablePageSkeleton filters cols={7} />}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  // A deep link such as /admin/orders?fulfillment=dead opens the table with that filter; the table then keeps its own state.
  const sp = await searchParams;
  const filter = { status: param(sp.status), fulfillment: param(sp.fulfillment), q: param(sp.q) };
  const { rows, total } = await listAdminOrders(filter, 1, DEFAULT_TABLE_PAGE_SIZE);
  const { q, ...rest } = filter;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Order" description="Semua order pembeli. Klik trade no untuk melihat invoice, fulfillment, dan grant." />
      <AdminOrdersTable
        initial={{ rows: rows.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })), total }}
        initialSearch={q ?? ""}
        initialFilters={Object.fromEntries(Object.entries(rest).filter((e): e is [string, string] => Boolean(e[1])))}
      />
    </div>
  );
}
