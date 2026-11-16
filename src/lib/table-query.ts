import { z } from "zod";

/** Query contract between the server-driven tables (`ServerDataTable`) and the admin list endpoints. Pure: shared by client and server. */

export const TABLE_PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_TABLE_PAGE_SIZE = 25;
export const MAX_TABLE_PAGE_SIZE = 100;

export type TableSort = { id: string; desc: boolean };

/** How one filter parameter is validated: a fixed set of values, free text (<= 100 chars) or a YYYY-MM-DD day. */
export type FilterSpec = readonly string[] | "text" | "date";

export type TableQuerySpec = {
  /** Column ids the endpoint can order by. Anything else is ignored, so a hand-made URL can never reach an arbitrary column. */
  sortable: readonly string[];
  filters?: Record<string, FilterSpec>;
};

export type TableQuery = {
  /** 1-based. */
  page: number;
  pageSize: number;
  sort: TableSort | null;
  q: string | undefined;
  filters: Record<string, string>;
};

const base = z.object({
  page: z.coerce.number().int().min(1).max(100_000).catch(1),
  pageSize: z
    .coerce.number()
    .int()
    .min(1)
    .catch(DEFAULT_TABLE_PAGE_SIZE)
    .transform((n) => Math.min(n, MAX_TABLE_PAGE_SIZE)),
  sort: z.string().max(40).optional().catch(undefined),
  dir: z.enum(["asc", "desc"]).catch("desc"),
  q: z.string().trim().max(100).optional().catch(undefined),
});

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function parseFilter(spec: FilterSpec, raw: string | null): string | undefined {
  if (raw === null) return undefined;
  const v = raw.trim();
  if (v === "") return undefined;
  if (spec === "text") return v.slice(0, 100);
  if (spec === "date") return DAY.test(v) ? v : undefined;
  return spec.includes(v) ? v : undefined;
}

/** Any invalid value falls back to "not set" (page 1, default size, newest first) instead of failing the request. */
export function parseTableQuery(params: URLSearchParams, spec: TableQuerySpec): TableQuery {
  const b = base.parse({
    page: params.get("page") ?? undefined,
    pageSize: params.get("pageSize") ?? undefined,
    sort: params.get("sort") ?? undefined,
    dir: params.get("dir") ?? undefined,
    q: params.get("q") ?? undefined,
  });
  const filters: Record<string, string> = {};
  for (const [name, fspec] of Object.entries(spec.filters ?? {})) {
    const v = parseFilter(fspec, params.get(name));
    if (v !== undefined) filters[name] = v;
  }
  return {
    page: b.page,
    pageSize: b.pageSize,
    sort: b.sort && spec.sortable.includes(b.sort) ? { id: b.sort, desc: b.dir === "desc" } : null,
    q: b.q || undefined,
    filters,
  };
}

/** The request the client sends for a table state. Empty values are left out. */
export function buildTableQuery(state: { pageIndex: number; pageSize: number; sort: TableSort | null; q?: string; filters?: Record<string, string> }): URLSearchParams {
  const p = new URLSearchParams();
  p.set("page", String(state.pageIndex + 1));
  p.set("pageSize", String(state.pageSize));
  if (state.sort) {
    p.set("sort", state.sort.id);
    p.set("dir", state.sort.desc ? "desc" : "asc");
  }
  if (state.q?.trim()) p.set("q", state.q.trim());
  for (const [k, v] of Object.entries(state.filters ?? {})) if (v) p.set(k, v);
  return p;
}
