import { parseTableQuery, type TableQuery, type TableQuerySpec } from "@/lib/table-query";
import { getAdminAccess } from "@/server/admin";

const NO_STORE = { "cache-control": "no-store" } as const;

/**
 * Shared body of the admin list endpoints (GET /api/admin/*). Same guard as the admin pages and the CSV export:
 * only an admin with 2FA gets data, everyone else a bare 404. Query parameters are validated by `parseTableQuery`
 * (page size <= 100, sort whitelist, filter values checked), and the response is never cached.
 */
export async function adminTableResponse<Row>(request: Request, spec: TableQuerySpec, run: (query: TableQuery) => Promise<{ rows: Row[]; total: number }>) {
  if ((await getAdminAccess()).kind !== "ok") return new Response(null, { status: 404, headers: NO_STORE });
  const query = parseTableQuery(new URL(request.url).searchParams, spec);
  try {
    const { rows, total } = await run(query);
    return Response.json({ rows, total, page: query.page, pageSize: query.pageSize }, { headers: NO_STORE });
  } catch (err) {
    console.error(`[api/admin] list failed reason=${err instanceof Error ? err.message : "unknown"}`);
    return Response.json({ error: "Data tidak bisa dimuat." }, { status: 500, headers: NO_STORE });
  }
}
