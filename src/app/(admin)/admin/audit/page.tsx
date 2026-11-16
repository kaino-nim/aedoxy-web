import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditTable } from "@/components/admin/audit-table";
import { param, type SearchParams } from "@/components/admin/common";
import { PageHeader } from "@/components/console/page-header";
import { TablePageSkeleton } from "@/components/console/skeletons";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/lib/table-query";
import { requireAdmin } from "@/server/admin";
import { listAudit } from "@/server/domain/admin-orders";

export const metadata: Metadata = { title: "Audit" };

export default function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<TablePageSkeleton filters cols={7} />}>
      <Audit searchParams={searchParams} />
    </Suspense>
  );
}

async function Audit({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = { action: param(sp.action), actor: param(sp.actor) };
  const { rows, total } = await listAudit(filter, 1, DEFAULT_TABLE_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Audit" description="Catatan aksi admin: siapa mengubah apa, nilai sebelum dan sesudahnya." />
      <AuditTable
        initial={{
          rows: rows.map(({ log, email }) => ({ id: log.id, createdAt: log.createdAt.toISOString(), actor: email ?? log.actorId, action: log.action, target: log.target, before: log.before, after: log.after, ip: log.ip })),
          total,
        }}
        initialFilters={Object.fromEntries(Object.entries(filter).filter((e): e is [string, string] => Boolean(e[1])))}
      />
    </div>
  );
}
