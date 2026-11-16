import { adminTableResponse } from "@/server/api/admin-table";
import { FULFILLMENT_STATUSES, listAdminOrders, ORDER_SORTABLE, ORDER_STATUSES } from "@/server/domain/admin-orders";

/** GET /api/admin/orders?page&pageSize&sort&dir&q&status&fulfillment : one page of orders. */
export async function GET(request: Request) {
  return adminTableResponse(
    request,
    { sortable: ORDER_SORTABLE, filters: { status: ORDER_STATUSES, fulfillment: FULFILLMENT_STATUSES } },
    async ({ page, pageSize, sort, q, filters }) => {
      const { rows, total } = await listAdminOrders({ ...filters, q }, page, pageSize, sort);
      return { rows, total };
    },
  );
}