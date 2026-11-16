"use client";

import { adminDate } from "@/components/admin/common";
import { dataColumns, type FilterDef } from "@/components/ui/data-table";
import { ServerDataTable } from "@/components/ui/server-data-table";
import { formatUsd, QUOTA_PER_USD } from "@/lib/format";
import { LEDGER_TYPE_VALUES } from "@/lib/order-status";

export type LedgerRow = { id: number; createdAt: string; type: string; delta: number; tradeNo: string | null; actorId: string | null; note: string | null };

const usd = (quota: number) => formatUsd(quota / QUOTA_PER_USD);
const col = dataColumns<LedgerRow>();

const columns = col.columns([
  col.accessor("createdAt", {
    header: "Waktu",
    sortFn: "text",
    cell: (c) => <span className="whitespace-nowrap text-fg-muted">{adminDate.format(new Date(c.getValue()))}</span>,
  }),
  col.accessor("type", { header: "Tipe", cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span> }),
  col.accessor("delta", {
    header: "Perubahan",
    meta: { align: "right" },
    cell: (c) => (
      <span className="font-mono">
        {c.getValue() > 0 ? "+" : ""}
        {usd(c.getValue())}
      </span>
    ),
  }),
  col.accessor((r) => r.tradeNo ?? "-", { id: "tradeNo", header: "Order", cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span> }),
  col.accessor((r) => r.actorId ?? "-", { id: "actorId", header: "Oleh", cell: (c) => <span title={c.getValue()} className="inline-block max-w-32 truncate align-bottom font-mono text-xs">{c.getValue()}</span> }),
  col.accessor((r) => r.note ?? "", { id: "note", header: "Catatan", cell: (c) => <span title={c.getValue()} className="inline-block max-w-64 truncate align-bottom text-fg-muted">{c.getValue()}</span> }),
]);

const FILTERS: FilterDef[] = [
  { id: "type", label: "Tipe", type: "select", options: LEDGER_TYPE_VALUES.map((t) => ({ value: t, label: t })) },
  { id: "from", label: "Dari (WIB)", type: "date" },
  { id: "to", label: "Sampai (WIB)", type: "date" },
];

/** Filtered, sorted and paged by GET /api/admin/ledger (TanStack Query); `initial` is the first page from the server. */
export function LedgerTable({ initial, initialFilters }: { initial: { rows: LedgerRow[]; total: number }; initialFilters?: Record<string, string> }) {
  return (
    <ServerDataTable
      endpoint="/api/admin/ledger"
      columns={columns}
      caption="Ledger pool"
      getRowId={(r) => String(r.id)}
      sortable={["createdAt", "type", "delta"]}
      filters={FILTERS}
      hideSearch
      initial={initial}
      initialFilters={initialFilters}
      empty="Tidak ada baris."
    />
  );
}