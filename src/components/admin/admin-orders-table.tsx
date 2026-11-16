"use client";

import Link from "next/link";
import { adminDate } from "@/components/admin/common";
import { OrderBadge } from "@/components/panel/order-badge";
import { Badge } from "@/components/ui/badge";
import { dataColumns, type FilterDef } from "@/components/ui/data-table";
import { ServerDataTable } from "@/components/ui/server-data-table";
import { formatIdr } from "@/lib/format";
import { FULFILLMENT_STATUS_VALUES, ORDER_STATUS_VALUES, type FulfillmentStatus, type GrantPhase, type OrderStatus } from "@/lib/order-status";

export type AdminOrderRow = {
  id: string;
  tradeNo: string;
  createdAt: string;
  email: string | null;
  planName: string | null;
  amountIdr: number;
  status: OrderStatus;
  fulfillment: FulfillmentStatus | null;
  grantPhase: GrantPhase | null;
  attempts: number | null;
};

const col = dataColumns<AdminOrderRow>();

const columns = col.columns([
  col.accessor("createdAt", {
    header: "Waktu",
    sortFn: "text",
    cell: (c) => <span className="whitespace-nowrap text-fg-muted">{adminDate.format(new Date(c.getValue()))}</span>,
  }),
  col.accessor("tradeNo", {
    header: "Trade no",
    cell: (c) => (
      <Link href={`/admin/orders/${c.row.original.id}`} className="font-mono text-xs text-primary-ink underline-offset-4 hover:underline">
        {c.getValue()}
      </Link>
    ),
  }),
  col.accessor((o) => o.email ?? "-", { id: "email", header: "Pembeli", cell: (c) => <span title={c.getValue()} className="inline-block max-w-48 truncate align-bottom text-fg-muted">{c.getValue()}</span> }),
  col.accessor((o) => o.planName ?? "-", { id: "planName", header: "Paket", cell: (c) => <span title={c.getValue()} className="inline-block max-w-48 truncate align-bottom">{c.getValue()}</span> }),
  col.accessor("amountIdr", { header: "Total", meta: { align: "right" }, cell: (c) => <span className="font-mono">{formatIdr(c.getValue())}</span> }),
  col.accessor("status", {
    header: "Status",
    cell: (c) => <OrderBadge status={c.getValue()} fulfillment={c.row.original.fulfillment} grantPhase={c.row.original.grantPhase} />,
  }),
  col.accessor((o) => o.fulfillment ?? "", {
    id: "fulfillment",
    header: "Fulfillment",
    cell: (c) => {
      const o = c.row.original;
      return o.fulfillment ? (
        <Badge variant={o.fulfillment === "dead" ? "destructive" : o.fulfillment === "succeeded" ? "default" : "secondary"}>
          {o.fulfillment}
          {o.attempts ? ` · ${o.attempts}x` : ""}
        </Badge>
      ) : (
        "-"
      );
    },
  }),
]);

const FILTERS: FilterDef[] = [
  { id: "status", label: "Status order", type: "select", options: ORDER_STATUS_VALUES.map((s) => ({ value: s, label: s })) },
  { id: "fulfillment", label: "Fulfillment", type: "select", options: FULFILLMENT_STATUS_VALUES.map((s) => ({ value: s, label: s })) },
];

/** Searched, filtered, sorted and paged by GET /api/admin/orders (TanStack Query); `initial` is the first page from the server. */
export function AdminOrdersTable({ initial, initialSearch, initialFilters }: { initial: { rows: AdminOrderRow[]; total: number }; initialSearch?: string; initialFilters?: Record<string, string> }) {
  return (
    <ServerDataTable
      endpoint="/api/admin/orders"
      columns={columns}
      caption="Order pembeli"
      getRowId={(o) => o.id}
      sortable={["createdAt", "tradeNo", "email", "amountIdr", "status"]}
      filters={FILTERS}
      searchLabel="Cari trade_no atau email"
      initial={initial}
      initialSearch={initialSearch}
      initialFilters={initialFilters}
      empty="Tidak ada order."
    />
  );
}