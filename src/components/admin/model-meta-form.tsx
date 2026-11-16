"use client";

import { Brain, Eye, EyeOff, FileText, ImageIcon, Loader2, Type, type LucideIcon } from "lucide-react";
import { useActionState } from "react";
import { saveModelMetaAction } from "@/app/(admin)/admin/models/actions";
import { Button } from "@/components/ui/button";
import { CheckButton } from "@/components/ui/check-button";
import { Input } from "@/components/ui/input";
import { CAPABILITY_VALUES } from "@/lib/schemas/model-meta";
import type { AdminFormState } from "@/server/admin-action";
import { Field } from "./common";
import { FormResult } from "./totp-field";

const input = "h-9 bg-background";
const CAPABILITY_LABEL: Record<(typeof CAPABILITY_VALUES)[number], string> = { text: "Teks", image: "Gambar", file: "File", reasoning: "Reasoning" };

const CAPABILITY_ICON: Record<(typeof CAPABILITY_VALUES)[number], LucideIcon> = { text: Type, image: ImageIcon, file: FileText, reasoning: Brain };

export type ModelMetaDefaults = {
  modelName: string;
  provider: string;
  contextIn: number | null;
  contextOut: number | null;
  capabilities: string[];
  officialInputUsdPerM: string | null;
  officialOutputUsdPerM: string | null;
  visible: boolean;
};

/**
 * Create or edit one row, inside the models dialog. The caller mounts it only while the dialog is open, so every
 * opening starts from `defaults`. `onSaved` runs after a successful save (the dialog closes and the list refreshes).
 */
export function ModelMetaForm({ defaults, onSaved }: { defaults: ModelMetaDefaults; onSaved: (message: string) => void }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(async (prev, formData) => {
    const next = await saveModelMetaAction(prev, formData);
    if (next.ok) onSaved(next.ok);
    return next;
  }, {});
  const fe = state.fieldErrors ?? {};
  const num = (v: number | string | null) => (v === null ? "" : String(Number(v)));
  return (
    <form action={action} className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
      <Field label="Nama model" htmlFor="modelName" hint="Persis seperti di New API. Nama yang sama memperbarui baris yang ada." error={fe.modelName?.[0]}>
        <Input id="modelName" name="modelName" defaultValue={defaults.modelName} required maxLength={200} className={input} />
      </Field>
      <Field label="Provider" htmlFor="provider" hint="Dipakai untuk pengelompokan dan logo, mis. openai, anthropic." error={fe.provider?.[0]}>
        <Input id="provider" name="provider" defaultValue={defaults.provider} required maxLength={60} className={input} />
      </Field>
      <Field label="Context input (token)" htmlFor="contextIn" error={fe.contextIn?.[0]}>
        <Input id="contextIn" name="contextIn" inputMode="numeric" defaultValue={num(defaults.contextIn)} className={input} />
      </Field>
      <Field label="Context output (token)" htmlFor="contextOut" error={fe.contextOut?.[0]}>
        <Input id="contextOut" name="contextOut" inputMode="numeric" defaultValue={num(defaults.contextOut)} className={input} />
      </Field>
      <Field label="Harga resmi input (USD / 1M)" htmlFor="officialInputUsdPerM" error={fe.officialInputUsdPerM?.[0]}>
        <Input id="officialInputUsdPerM" name="officialInputUsdPerM" inputMode="decimal" defaultValue={num(defaults.officialInputUsdPerM)} className={input} />
      </Field>
      <Field label="Harga resmi output (USD / 1M)" htmlFor="officialOutputUsdPerM" error={fe.officialOutputUsdPerM?.[0]}>
        <Input id="officialOutputUsdPerM" name="officialOutputUsdPerM" inputMode="decimal" defaultValue={num(defaults.officialOutputUsdPerM)} className={input} />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="mono-label mb-2">Kemampuan</legend>
        <div className="flex flex-wrap gap-2">
          {CAPABILITY_VALUES.map((c) => {
            const Icon = CAPABILITY_ICON[c];
            return (
              <CheckButton key={c} name={`cap_${c}`} defaultChecked={defaults.capabilities.includes(c)} icon={<Icon />}>
                {CAPABILITY_LABEL[c]}
              </CheckButton>
            );
          })}
          <CheckButton name="visible" defaultChecked={defaults.visible} icon={<EyeOff />} checkedIcon={<Eye />} className="sm:ml-auto">
            Tampil di /models
          </CheckButton>
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending} className="h-10 px-4 text-sm font-semibold">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Simpan metadata
        </Button>
        <FormResult error={state.error} ok={state.ok} />
      </div>
    </form>
  );
}
