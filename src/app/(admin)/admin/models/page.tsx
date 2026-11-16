import type { Metadata } from "next";
import { Suspense } from "react";
import { param, type SearchParams } from "@/components/admin/common";
import { ModelsManager } from "@/components/admin/models-manager";
import { TablePageSkeleton } from "@/components/console/skeletons";
import { requireAdmin } from "@/server/admin";
import { getCatalog } from "@/server/catalog";
import { listModelMeta } from "@/server/domain/admin-models";

export const metadata: Metadata = { title: "Model" };

export default function ModelsAdminPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<TablePageSkeleton filters cols={7} />}>
      <ModelsAdmin searchParams={searchParams} />
    </Suspense>
  );
}

async function ModelsAdmin({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const [metas, catalog] = await Promise.all([listModelMeta(), getCatalog()]);
  const known = new Set(metas.map((m) => m.modelName));

  return (
    <ModelsManager
      rows={metas}
      missing={catalog.models.filter((m) => !known.has(m.id)).map((m) => m.id)}
      initialModel={param(sp.edit) ?? param(sp.model)}
      catalogUnavailable={catalog.state !== "ok"}
    />
  );
}
