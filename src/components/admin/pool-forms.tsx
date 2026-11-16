"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { adjustPoolAction, setThresholdAction } from "@/app/(admin)/admin/pool/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminFormState } from "@/server/admin-action";
import { Card, Field, NativeSelect } from "./common";
import { FormResult } from "./totp-field";

export function AdjustPoolForm() {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(adjustPoolAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <Card className="h-full py-5">
      <h2 className="text-base font-medium text-heading">Tambah / kurangi stok</h2>
      <p className="mt-1 text-sm leading-relaxed text-fg-muted">Setiap perubahan tercatat di ledger dan audit log.</p>
      <form action={action} className="mt-4 flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Aksi" htmlFor="direction">
            <NativeSelect id="direction" name="direction" defaultValue="add">
              <option value="add">Tambah</option>
              <option value="remove">Kurangi</option>
            </NativeSelect>
          </Field>
          <Field label="Nominal (USD)" htmlFor="amountUsd" error={fe.amountUsd?.[0]}>
            <Input id="amountUsd" name="amountUsd" inputMode="decimal" placeholder="100" required className="h-9 bg-background" />
          </Field>
        </div>
        <Field label="Catatan" htmlFor="note" hint="Wajib. Contoh: top up upstream Anthropic, invoice #123." error={fe.note?.[0]}>
          <Textarea id="note" name="note" required maxLength={300} rows={2} className="bg-background" />
        </Field>
        <FormResult error={state.error} ok={state.ok} />
        <Button type="submit" disabled={pending} className="mt-auto h-10 self-start px-4 text-sm font-semibold">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Simpan perubahan stok
        </Button>
      </form>
    </Card>
  );
}

export function ThresholdForm({ currentUsd, effectiveText }: { currentUsd: number; effectiveText: string }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(setThresholdAction, {});
  return (
    <Card className="h-full py-5">
      <h2 className="text-base font-medium text-heading">Ambang stok hampir habis</h2>
      <p className="mt-1 text-sm leading-relaxed text-fg-muted">Di bawah ambang ini, pembeli melihat status “stok menipis”. Isi 0 untuk memakai bawaan ($50).</p>
      <form action={action} className="mt-4 flex flex-1 flex-col gap-4">
        <Field label="Ambang (USD)" htmlFor="thresholdUsd" error={state.fieldErrors?.thresholdUsd?.[0]}>
          <Input id="thresholdUsd" name="thresholdUsd" inputMode="decimal" defaultValue={String(currentUsd)} required className="h-9 bg-background" />
        </Field>
        <p className="text-sm text-fg-muted">
          Ambang yang berlaku sekarang: <span className="font-mono text-heading">{effectiveText}</span>.
        </p>
        <FormResult error={state.error} ok={state.ok} />
        <Button type="submit" variant="outline" disabled={pending} className="mt-auto h-10 self-start px-4 text-sm font-semibold">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Simpan ambang
        </Button>
      </form>
    </Card>
  );
}
