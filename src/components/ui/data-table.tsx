"use client";

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TableCard } from "@/components/console/table-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TABLE_PAGE_SIZES } from "@/lib/table-query";
import { cn } from "@/lib/utils";

export const PAGE_SIZE = 10;

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString, equalsString: filterFn_equalsString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic, datetime: sortFn_datetime },
  columnMeta: metaHelper<{ align?: "right"; hideBelow?: HideBelow }>(),
});

/** Viewport widths under which a column is hidden (so a wide table fits without sideways scroll). Full class names so Tailwind sees them. */
const HIDE_BELOW = { xl: "max-xl:hidden", wide: "max-[1359px]:hidden" } as const;
type HideBelow = keyof typeof HIDE_BELOW;

/** Column definitions for `<DataTable>`: `dataColumns<Row>().columns([c.accessor(...), c.display(...)])`. Cells may render any React node. */
export const dataColumns = <T extends RowData>() => createColumnHelper<typeof features, T>();
// The helper yields columns of mixed value types, so the value type is left open (`any` is what `helper.columns()` returns).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataColumn<T extends RowData> = ColumnDef<typeof features, T, any>;

/** A toolbar filter. In client mode only `select` works (it filters on the column's accessor value, compared as a string). */
export type FilterDef = { id: string; label: string } & ({ type: "select"; options: { value: string; label: string }[] } | { type: "text" } | { type: "date" });

/** Table state owned by the caller (`ServerDataTable`): the rows are already searched, filtered, sorted and paged by the server. */
export type ServerTableState = {
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: (updater: Updater<PaginationState>) => void;
  sorting: SortingState;
  onSortingChange: (updater: Updater<SortingState>) => void;
  /** Column ids the server can order by; the other headers are not clickable. */
  sortable: readonly string[];
  /** null = no search box. */
  search: string | null;
  onSearchChange: (value: string) => void;
  filterValues: Record<string, string>;
  onFilterChange: (id: string, value: string) => void;
  /** A request is in flight (the previous page stays visible). */
  fetching: boolean;
};

/** Select options from the distinct, non-empty values found in the data (for client-side filter menus). */
export const optionsFrom = (values: Iterable<string>) =>
  [...new Set(values)]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((v) => ({ value: v, label: v }));

const ALL = "__all";
const rowSkeletons = 5;
const hide = (b?: HideBelow) => (b ? HIDE_BELOW[b] : undefined);
const columnId = (c: { id?: string; accessorKey?: string | number | symbol }) => c.id ?? String(c.accessorKey ?? "");

/** Text box that keeps its own draft and reports it 300 ms after typing stops (dates at once). The parent only ever echoes the reported value back. */
function DebouncedInput({ value, onChange, label, type = "search", className }: { value: string; onChange: (v: string) => void; label: string; type?: string; className?: string }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (draft === value) return;
    const id = setTimeout(() => onChange(draft), type === "date" ? 0 : 300);
    return () => clearTimeout(id);
  }, [draft, value, onChange, type]);
  return <Input type={type} aria-label={label} placeholder={type === "date" ? undefined : `${label}...`} value={draft} onChange={(e) => setDraft(e.target.value)} className={cn("h-9 bg-background", className)} />;
}

function FilterControl({ def, value, onChange }: { def: FilterDef; value: string; onChange: (v: string) => void }) {
  if (def.type === "select") {
    return (
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
        <SelectTrigger aria-label={def.label} className="h-9 w-auto min-w-36 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value={ALL}>{def.label}: semua</SelectItem>
          {def.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  return (
    <label className="flex items-center gap-2 text-xs text-fg-muted">
      <span className="whitespace-nowrap">{def.label}</span>
      <DebouncedInput value={value} onChange={onChange} label={def.label} type={def.type === "date" ? "date" : "text"} className={def.type === "date" ? "w-40" : "w-44"} />
    </label>
  );
}

/**
 * One table for the whole app (TanStack Table v9 over the shadcn Table, inside a TableCard that scrolls sideways).
 * Toolbar: search, filters, sortable headers; footer: "x-y dari N", page size, first/previous/next/last.
 * Client mode (default): the table owns search, filters, sort and paging over `data`.
 * `server` mode: the caller owns that state and passes the current page as `data` (see ServerDataTable).
 * `data` and `columns` must be stable references (module scope, props, or a query result).
 */
export function DataTable<T extends RowData>({
  data,
  columns,
  caption,
  getRowId,
  server,
  filters = [],
  isLoading = false,
  error,
  onRetry,
  empty = "Belum ada data.",
  searchLabel = "Cari",
  pageSize = PAGE_SIZE,
  compact = false,
  className,
}: {
  data: T[];
  columns: DataColumn<T>[];
  /** Accessible name of the table (screen readers only). */
  caption: string;
  getRowId?: (row: T) => string;
  server?: ServerTableState;
  filters?: FilterDef[];
  isLoading?: boolean;
  /** Shows the error state instead of the rows. */
  error?: string | null;
  onRetry?: () => void;
  empty?: React.ReactNode;
  searchLabel?: string;
  /** Initial page size (client mode). */
  pageSize?: number;
  /** Tighter cell padding, for tables with many columns. */
  compact?: boolean;
  className?: string;
}) {
  const filterIds = useMemo(() => new Set(filters.map((f) => f.id)), [filters]);
  const sortableIds = server?.sortable;
  // Columns the toolbar filters on compare their value as a string; server tables can only sort what the endpoint whitelists.
  const tableColumns = useMemo(
    () =>
      columns.map((c) => {
        const id = columnId(c as { id?: string; accessorKey?: string });
        if (sortableIds) return { ...c, enableSorting: sortableIds.includes(id) } as DataColumn<T>;
        return filterIds.has(id) ? ({ ...c, filterFn: "equalsString" } as DataColumn<T>) : c;
      }),
    [columns, filterIds, sortableIds],
  );

  const table = useTable({
    features,
    columns: tableColumns,
    data,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    globalFilterFn: "includesString",
    ...(server
      ? {
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          autoResetPageIndex: false,
          rowCount: server.rowCount,
          state: { pagination: server.pagination, sorting: server.sorting },
          onPaginationChange: server.onPaginationChange,
          onSortingChange: server.onSortingChange,
        }
      : { initialState: { pagination: { pageIndex: 0, pageSize } } }),
  });

  const columnCount = table.getAllLeafColumns().length;
  const rows = table.getRowModel().rows;
  const { pageIndex, pageSize: size } = table.state.pagination;
  const total = server ? server.rowCount : table.getPrePaginatedRowModel().rows.length;
  const from = total === 0 ? 0 : pageIndex * size + 1;
  const to = Math.min(total, (pageIndex + 1) * size);
  const pageCount = Math.max(1, Math.ceil(total / size));
  const search = server ? (server.search ?? "") : typeof table.state.globalFilter === "string" ? table.state.globalFilter : "";
  const showSearch = server ? server.search !== null : true;
  const activeFilter = (id: string) => (server ? (server.filterValues[id] ?? "") : String(table.getColumn(id)?.getFilterValue() ?? ""));
  const anyFilter = search !== "" || filters.some((f) => activeFilter(f.id) !== "");
  const setFilter = (id: string, v: string) => {
    if (server) server.onFilterChange(id, v);
    else table.getColumn(id)?.setFilterValue(v === "" ? undefined : v);
  };
  const busy = isLoading || server?.fetching;

  return (
    <div className={cn("space-y-3", className)}>
      {(showSearch || filters.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {showSearch && (
            <div className="relative w-full sm:max-w-xs">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint" />
              <DebouncedInput
                value={search}
                onChange={server ? server.onSearchChange : (v) => table.setGlobalFilter(v)}
                label={searchLabel}
                className="pl-8"
              />
            </div>
          )}
          {filters.map((f) => (
            <FilterControl key={f.id} def={f} value={activeFilter(f.id)} onChange={(v) => setFilter(f.id, v)} />
          ))}
        </div>
      )}

      <TableCard className={cn(compact && "[&_td]:px-2 [&_th]:px-2", server?.fetching && "opacity-70 transition-opacity")}>
        <Table aria-busy={busy || undefined}>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const column = header.column;
                  const sorted = column.getIsSorted();
                  const right = column.columnDef.meta?.align === "right";
                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      aria-sort={column.getCanSort() ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
                      className={cn(right && "text-right", hide(column.columnDef.meta?.hideBelow))}
                    >
                      {header.isPlaceholder ? null : column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={column.getToggleSortingHandler()}
                          className={cn(
                            "-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase outline-none hover:text-heading focus-visible:ring-3 focus-visible:ring-ring/50",
                            sorted && "text-heading",
                          )}
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? <ArrowUp aria-hidden className="size-3" /> : sorted === "desc" ? <ArrowDown aria-hidden className="size-3" /> : <ChevronsUpDown aria-hidden className="size-3 opacity-50" />}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: rowSkeletons }, (_, i) => (
                <TableRow key={i} aria-hidden>
                  {Array.from({ length: columnCount }, (_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full min-w-12 bg-line" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="py-8 text-center whitespace-normal">
                  <p role="alert" className="text-sm text-danger">
                    {error}
                  </p>
                  {onRetry && (
                    <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                      Coba lagi
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="py-8 text-center whitespace-normal text-fg-muted">
                  {anyFilter ? "Tidak ada hasil untuk pencarian atau filter ini." : empty}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(cell.column.columnDef.meta?.align === "right" && "text-right", hide(cell.column.columnDef.meta?.hideBelow))}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>

      {!error && !isLoading && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-fg-muted">
          <p aria-live="polite">
            Menampilkan {from}-{to} dari {total}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs">
              <span>Baris per halaman</span>
              <Select value={String(size)} onValueChange={(v) => table.setPageSize(Number(v))}>
                <SelectTrigger aria-label="Baris per halaman" className="h-8 w-[4.5rem] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {[...new Set<number>([...TABLE_PAGE_SIZES, size])]
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </label>
            {pageCount > 1 && (
              <div className="flex items-center gap-1">
                <span className="mr-1 text-xs">
                  Halaman {pageIndex + 1} dari {pageCount}
                </span>
                <Button type="button" variant="outline" size="icon-sm" aria-label="Halaman pertama" disabled={!table.getCanPreviousPage()} onClick={() => table.firstPage()}>
                  <ChevronsLeft aria-hidden />
                </Button>
                <Button type="button" variant="outline" size="icon-sm" aria-label="Halaman sebelumnya" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
                  <ChevronLeft aria-hidden />
                </Button>
                <Button type="button" variant="outline" size="icon-sm" aria-label="Halaman berikutnya" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
                  <ChevronRight aria-hidden />
                </Button>
                <Button type="button" variant="outline" size="icon-sm" aria-label="Halaman terakhir" disabled={!table.getCanNextPage()} onClick={() => table.lastPage()}>
                  <ChevronsRight aria-hidden />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
