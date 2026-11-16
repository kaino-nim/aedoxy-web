"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModelMetaForm, type ModelMetaDefaults } from "@/components/admin/model-meta-form";
import { ModelsTable, type ModelTableRow } from "@/components/admin/models-table";
import { FormResult } from "@/components/admin/totp-field";
import { PageHeader } from "@/components/console/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EMPTY: ModelMetaDefaults = { modelName: "", provider: "", contextIn: null, contextOut: null, capabilities: [], officialInputUsdPerM: null, officialOutputUsdPerM: null, visible: true };

/** `null` = closed, `{ mode: "create" }` or `{ mode: "edit" }` with the values the form starts from. */
type DialogState = { mode: "create" | "edit"; defaults: ModelMetaDefaults } | null;

/**
 * Header, "Tambah model" button, models without metadata and the table, plus the one create/update dialog they share.
 * `initialModel` is a deep link (?edit= / ?model=): the dialog opens on it once.
 */
export function ModelsManager({
  rows,
  missing,
  initialModel,
  catalogUnavailable,
}: {
  rows: ModelTableRow[];
  /** Model names New API lists that have no metadata yet. */
  missing: string[];
  initialModel?: string;
  catalogUnavailable: boolean;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(() => {
    if (!initialModel) return null;
    const row = rows.find((m) => m.modelName === initialModel);
    return row ? { mode: "edit", defaults: row } : { mode: "create", defaults: { ...EMPTY, modelName: initialModel } };
  });
  const [done, setDone] = useState<string | null>(null);

  const open = (state: DialogState) => {
    setDone(null);
    setDialog(state);
  };
  const close = () => {
    setDialog(null);
    if (initialModel) router.replace("/admin/models"); // drop the deep-link parameter
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Metadata model"
        description={
          <>
            Daftar dan biaya kredit model datang dari New API. Di sini Anda mengisi yang tidak disimpan New API: provider, context, kemampuan, dan harga resmi.
            {catalogUnavailable && " Daftar model dari New API belum bisa dimuat sekarang."}
          </>
        }
        actions={
          <Button type="button" onClick={() => open({ mode: "create", defaults: EMPTY })} className="h-10 px-4 text-sm font-semibold">
            <Plus className="size-4" aria-hidden />
            Tambah model
          </Button>
        }
      />

      {done && <FormResult ok={done} />}

      {missing.length > 0 && (
        <div>
          <h2 className="text-xl font-medium tracking-[-0.02em] text-heading">Model tanpa metadata</h2>
          <p className="mt-1 text-sm text-fg-muted">Tampil di /models dengan context dan kemampuan kosong sampai diisi.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {missing.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => open({ mode: "create", defaults: { ...EMPTY, modelName: name } })}
                  className="rounded-full border border-line-strong px-3 py-1 font-mono text-xs text-fg-soft hover:text-heading focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="pt-2 text-xl font-medium tracking-[-0.02em] text-heading">Metadata tersimpan</h2>
      <ModelsTable rows={rows} onEdit={(row) => open({ mode: "edit", defaults: row })} />

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "edit" ? `Ubah ${dialog.defaults.modelName}` : "Tambah metadata model"}</DialogTitle>
            <DialogDescription>
              {dialog?.mode === "edit" ? "Perubahan tercatat di audit log." : "Nama yang sama dengan model yang sudah ada memperbarui barisnya."}
            </DialogDescription>
          </DialogHeader>
          {dialog && (
            <ModelMetaForm
              defaults={dialog.defaults}
              onSaved={(message) => {
                setDone(message);
                close();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
