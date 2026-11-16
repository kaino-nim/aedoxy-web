"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, RowData, SortingState, Updater } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { DataTable, type DataColumn, type FilterDef } from "@/components/ui/data-table";
import { buildTableQuery, DEFAULT_TABLE_PAGE_SIZE } from "@/lib/table-query";

type Page<T> = { rows: T[]; total: number };

const resolve = <S,>(updater: Updater<S>, prev: S): S => (typeof updater === "function" ? (updater as (old: S) => S)(prev) : updater);

/**
 * DataTable whose rows come from a JSON list endpoint (`GET endpoint?page&pageSize&sort&dir&q&<filters>`), fetched with
 * TanStack Query. The table state (page, size, sort, search, filters) is part of the query key, so each combination is
 * cached; the previous page stays on screen while the next one loads. `initial` is the first page rendered by the server
 * component, used as the cache entry for the default state so the first paint has data and no request.
 */
export function ServerDataTable<T extends RowData>({
  endpoint,
  columns,
  caption,
  getRowId,
  sortable,
  filters = [],
  searchLabel,
  hideSearch = false,
  defaultSort = null,
  initial,
  initialSearch = "",
  initialFilters,
  empty,
  compact,
}: {
  endpoint: string;
  columns: DataColumn<T>[];
  caption: string;
  getRowId: (row: T) => string;
  /** Column ids the endpoint can order by. */
  sortable: readonly string[];
  filters?: FilterDef[];
  searchLabel?: string;
  hideSearch?: boolean;
  /** Order the endpoint applies when no sort is sent (shown as no active sort). */
  defaultSort?: SortingState | null;
  /** First page rendered by the server for `initialSearch` / `initialFilters` and the default sort and size. */
  initial?: Page<T>;
  /** Search text and filter values the page was opened with (e.g. a deep link such as ?fulfillment=dead). */
  initialSearch?: string;
  initialFilters?: Record<string, string>;
  empty?: React.ReactNode;
  compact?: boolean;
}) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE });
  const [sorting, setSorting] = useState<SortingState>(defaultSort ?? []);
  const [search, setSearch] = useState(initialSearch);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialFilters ?? {});
  // The request `initial` answers: first page, default size and sort, with the values the page was opened with.
  const [initialParams] = useState(() =>
    buildTableQuery({ pageIndex: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE, sort: defaultSort?.[0] ? { id: defaultSort[0].id, desc: defaultSort[0].desc } : null, q: hideSearch ? "" : initialSearch, filters: initialFilters }).toString(),
  );

  const params = useMemo(() => {
    const sort = sorting[0] ? { id: sorting[0].id, desc: sorting[0].desc } : null;
    return buildTableQuery({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize, sort, q: hideSearch ? "" : search, filters: filterValues }).toString();
  }, [pagination, sorting, search, filterValues, hideSearch]);


  const query = useQuery<Page<T>>({
    queryKey: [endpoint, params],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${endpoint}?${params}`, { signal, cache: "no-store" });
      if (!res.ok) throw new Error(res.status === 404 ? "Sesi admin berakhir. Muat ulang halaman." : "Data tidak bisa dimuat.");
      return (await res.json()) as Page<T>;
    },
    placeholderData: keepPreviousData,
    initialData: params === initialParams ? initial : undefined,
    staleTime: 15_000,
  });

  // Any change of what is searched or filtered goes back to page 1.
  const firstPage = useCallback(() => setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 })), []);
  const onSearchChange = useCallback(
    (v: string) => {
      setSearch(v);
      firstPage();
    },
    [firstPage],
  );
  const onFilterChange = useCallback(
    (id: string, v: string) => {
      setFilterValues((prev) => ({ ...prev, [id]: v }));
      firstPage();
    },
    [firstPage],
  );

  const rows = query.data?.rows;
  return (
    <DataTable
      data={rows ?? EMPTY}
      columns={columns}
      caption={caption}
      getRowId={getRowId}
      filters={filters}
      searchLabel={searchLabel}
      empty={empty}
      compact={compact}
      isLoading={query.isPending}
      error={query.isError && !rows ? query.error.message : null}
      onRetry={() => query.refetch()}
      server={{
        rowCount: query.data?.total ?? 0,
        pagination,
        onPaginationChange: (u) => setPagination((p) => resolve(u, p)),
        sorting,
        onSortingChange: (u) => {
          setSorting((s) => resolve(u, s));
          firstPage();
        },
        sortable,
        search: hideSearch ? null : search,
        onSearchChange,
        filterValues,
        onFilterChange,
        fetching: query.isFetching && !query.isPending,
      }}
    />
  );
}

const EMPTY: never[] = [];
