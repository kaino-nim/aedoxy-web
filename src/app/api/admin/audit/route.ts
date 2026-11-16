import { adminTableResponse } from "@/server/api/admin-table";
import { AUDIT_SORTABLE, listAudit } from "@/server/domain/admin-orders";

/** GET /api/admin/audit?page&pageSize&sort&dir&action&actor : one page of the admin audit log. */
export async function GET(request: Request) {
  return adminTableResponse(request, { sortable: AUDIT_SORTABLE, filters: { action: "text", actor: "text" } }, async ({ page, pageSize, sort, filters }) => {
    const { rows, total } = await listAudit(filters, page, pageSize, sort);
    return {
      rows: rows.map(({ log, email }) => ({
        id: log.id,
        createdAt: log.createdAt.toISOString(),
        actor: email ?? log.actorId,
        action: log.action,
        target: log.target,
        before: log.before,
        after: log.after,
        ip: log.ip,
      })),
      total,
    };
  });
}