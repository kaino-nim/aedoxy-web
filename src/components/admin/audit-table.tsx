"use client";

import { adminDate } from "@/components/admin/common";
import { dataColumns, type FilterDef } from "@/components/ui/data-table";
import { ServerDataTable } from "@/components/ui/server-data-table";

export type AuditRow = {
  id: number;
  createdAt: string;
  actor: string;
  action: string;
  target: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
};

/** Compact JSON for a table cell; the full value is in the tooltip. */
function Json({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="text-faint">-</span>;
  const full = JSON.stringify(value);
  return (
    <code title={full} className="block max-w-72 truncate font-mono text-xs text-fg-soft">
      {full}
    </code>
  );
}

const col = dataColumns<AuditRow>();

const columns = col.columns([
  col.accessor("createdAt", {
    header: "Waktu",
    sortFn: "text",
    cell: (c) => <span className="whitespace-nowrap text-fg-muted">{adminDate.format(new Date(c.getValue()))}</span>,
  }),
  col.accessor("actor", { header: "Pelaku", cell: (c) => <span title={c.getValue()} className="inline-block max-w-40 truncate align-bottom text-xs">{c.getValue()}</span> }),
  col.accessor("action", { header: "Aksi", cell: (c) => <span className="font-mono text-xs">{c.getValue()}</span> }),
  col.accessor((r) => r.target ?? "-", { id: "target", header: "Target", cell: (c) => <span title={c.getValue()} className="inline-block max-w-56 truncate align-bottom font-mono text-xs">{c.getValue()}</span> }),
  col.display({ id: "before", header: "Sebelum", enableSorting: false, cell: (c) => <Json value={c.row.original.before} /> }),
  col.display({ id: "after", header: "Sesudah", enableSorting: false, cell: (c) => <Json value={c.row.original.after} /> }),
  col.accessor((r) => r.ip ?? "-", { id: "ip", header: "IP", cell: (c) => <span className="font-mono text-xs text-fg-muted">{c.getValue()}</span> }),
]);

const FILTERS: FilterDef[] = [
  { id: "action", label: "Aksi (awalan)", type: "text" },
  { id: "actor", label: "Pelaku (id/email)", type: "text" },
];

/** Filtered, sorted and paged by GET /api/admin/audit (TanStack Query); `initial` is the first page from the server. */
export function AuditTable({ initial, initialFilters }: { initial: { rows: AuditRow[]; total: number }; initialFilters?: Record<string, string> }) {
  return (
    <ServerDataTable
      endpoint="/api/admin/audit"
      columns={columns}
      caption="Catatan audit admin"
      getRowId={(r) => String(r.id)}
      sortable={["createdAt", "action", "target"]}
      filters={FILTERS}
      hideSearch
      initial={initial}
      initialFilters={initialFilters}
      empty="Tidak ada catatan."
    />
  );
}