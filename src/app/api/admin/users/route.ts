import { adminTableResponse } from "@/server/api/admin-table";
import { listAdminUsers, USER_ROLES, USER_SORTABLE } from "@/server/domain/admin-users";

/** GET /api/admin/users?page&pageSize&sort&dir&q&role&status&verified&console : one page of the user list (no secrets are selected). */
export async function GET(request: Request) {
  return adminTableResponse(
    request,
    {
      sortable: USER_SORTABLE,
      filters: { role: USER_ROLES, status: ["active", "banned", "terhapus"], verified: ["yes", "no"], console: ["linked", "unlinked"] },
    },
    async ({ page, pageSize, sort, q, filters }) => {
      const { rows, total } = await listAdminUsers({ q, ...filters } as Parameters<typeof listAdminUsers>[0], page, pageSize, sort);
      return { rows, total };
    },
  );
}