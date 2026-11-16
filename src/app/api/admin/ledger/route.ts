import { adminTableResponse } from "@/server/api/admin-table";
import { LEDGER_SORTABLE, LEDGER_TYPES, listLedger } from "@/server/domain/admin-pool";

/** GET /api/admin/ledger?page&pageSize&sort&dir&type&from&to : one page of the pool ledger. */
export async function GET(request: Request) {
  return adminTableResponse(request, { sortable: LEDGER_SORTABLE, filters: { type: LEDGER_TYPES, from: "date", to: "date" } }, async ({ page, pageSize, sort, filters }) => {
    const { rows, total } = await listLedger(filters, page, pageSize, sort);
    return { rows, total };
  });
}