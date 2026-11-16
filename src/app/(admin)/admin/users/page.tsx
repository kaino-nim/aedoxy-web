import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import type { SearchParams } from "@/components/admin/common";
import { PageHeader } from "@/components/console/page-header";
import { TablePageSkeleton } from "@/components/console/skeletons";
import { requireAdmin } from "@/server/admin";
import { listAdminUsers, parseUserQuery } from "@/server/domain/admin-users";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/lib/table-query";

export const metadata: Metadata = { title: "Pengguna" };

export default function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<TablePageSkeleton filters cols={8} />}>
      <Users searchParams={searchParams} />
    </Suspense>
  );
}

async function Users({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  // A deep link (?role=admin&q=...) opens the table with those values; the table then keeps its own state.
  const { filter } = parseUserQuery(await searchParams);
  const { rows, total } = await listAdminUsers(filter, 1, DEFAULT_TABLE_PAGE_SIZE);
  const { q, ...rest } = filter;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Pengguna" description="Cari dan kelola pengguna aedoxy.com. Klik username untuk melihat detail dan mengelola akun." />
      <AdminUsersTable
        initial={{ rows: rows.map((u) => ({ ...u, createdAt: u.createdAt.toISOString(), banExpires: u.banExpires?.toISOString() ?? null })), total }}
        initialSearch={q ?? ""}
        initialFilters={Object.fromEntries(Object.entries(rest).filter(([, v]) => Boolean(v)) as [string, string][])}
      />
    </div>
  );
}