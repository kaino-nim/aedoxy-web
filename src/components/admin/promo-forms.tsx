"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { createPromoAction, stopPromoAction } from "@/app/(admin)/admin/promos/actions";
import { Button } from "@/components/ui/button";
import { CheckButton } from "@/components/ui/check-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { discountedAmount, isValidPromoValue, type PromoKind } from "@/lib/discount";
import { formatIdr } from "@/lib/format";
import type { AdminFormState } from "@/server/admin-action";
import { Card, Field, NativeSelect } from "./common";
import { FormResult } from "./totp-field";

const input = "h-9 bg-background";
/** Two columns from sm, three from lg; the group title spans the whole row. */
const GRID = "gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 grid";
const GROUP_TITLE = "col-span-full text-sm font-medium text-heading";

type PlanOption = { id: number; name: string; priceIdr: number };

export function PromoForm({ plans }: { plans: PlanOption[] }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(createPromoAction, {});
  const [kind, setKind] = useState<PromoKind>("percent");
  const [value, setValue] = useState("10");
  const [sampleId, setSampleId] = useState(plans[0]?.id ?? 0);
  const fe = state.fieldErrors ?? {};

  const sample = plans.find((p) => p.id === sampleId);
  const n = /^\d+$/.test(value) ? Number(value) : NaN;
  // The very function the order uses, so the preview cannot drift from what the buyer pays.
  const preview = sample && isValidPromoValue(kind, n) ? discountedAmount(sample.priceIdr, kind, n) : null;

  return (
    <form action={action} className="w-full space-y-4">
      {/* lg+: the form on the left, "Berlaku untuk" stretches down the right column. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-stretch">
      <div className="space-y-4">
      <Card className={`py-4 ${GRID}`}>
        <h2 className={GROUP_TITLE}>Promo</h2>
        <Field label="Nama promo" htmlFor="name" error={fe.name?.[0]}>
          <Input id="name" name="name" required maxLength={80} className={input} />
        </Field>
        <Field label="Kode promo" htmlFor="code" hint="Kosong = diskon otomatis. Diisi = harus dimasukkan pembeli (huruf besar/kecil sama)." error={fe.code?.[0]}>
          <Input id="code" name="code" maxLength={32} autoComplete="off" className={input} />
        </Field>
        <Field label="Jenis" htmlFor="kind" error={fe.kind?.[0]}>
          <NativeSelect id="kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value as PromoKind)}>
            <option value="percent">Persen (1-90%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </NativeSelect>
        </Field>
        <Field label={kind === "percent" ? "Persen" : "Potongan (Rp)"} htmlFor="value" error={fe.value?.[0]}>
          <Input id="value" name="value" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} required className={input} />
        </Field>
      </Card>

      <Card className={`py-4 ${GRID}`}>
        <h2 className={GROUP_TITLE}>Masa berlaku &amp; batas</h2>
        <Field label="Mulai (WIB)" htmlFor="startsAt" hint="Kosong = langsung." error={fe.startsAt?.[0]}>
          <Input id="startsAt" name="startsAt" type="datetime-local" className={input} />
        </Field>
        <Field label="Selesai (WIB)" htmlFor="endsAt" hint="Kosong = tanpa batas waktu." error={fe.endsAt?.[0]}>
          <Input id="endsAt" name="endsAt" type="datetime-local" className={input} />
        </Field>
        <Field label="Kuota total" htmlFor="maxRedemptions" hint="Kosong = tanpa batas." error={fe.maxRedemptions?.[0]}>
          <Input id="maxRedemptions" name="maxRedemptions" inputMode="numeric" className={input} />
        </Field>
        <Field label="Batas per user" htmlFor="perUserLimit" hint="Kosong = tanpa batas." error={fe.perUserLimit?.[0]}>
          <Input id="perUserLimit" name="perUserLimit" inputMode="numeric" defaultValue="1" className={input} />
        </Field>
      </Card>


      </div>

      <div className="space-y-4">
      <Card className="flex flex-col py-4">
        <p className="mono-label">Berlaku untuk</p>
        <p className="mt-1 text-xs text-faint">Tidak ada yang dipilih = semua paket.</p>
        <div className="mt-3 flex flex-col gap-2">
          {plans.map((p) => (
            <CheckButton key={p.id} name={`plan_${p.id}`} className="h-10 w-full justify-start">
              {p.name} <span className="font-mono text-xs opacity-70">{formatIdr(p.priceIdr)}</span>
            </CheckButton>
          ))}
        </div>
      </Card>
      <Card className="py-4">
        <p className="mono-label">Pratinjau harga</p>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div className="min-w-48">
            <label htmlFor="sample" className="mono-label mb-1.5 block">
              Paket contoh
            </label>
            <NativeSelect id="sample" value={sampleId} onChange={(e) => setSampleId(Number(e.target.value))}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <p className="text-sm text-fg-muted" aria-live="polite">
            {!sample ? (
              "Belum ada paket."
            ) : preview ? (
              <>
                Harga flat {formatIdr(sample.priceIdr)}, potongan {formatIdr(preview.discountIdr)}, pembeli membayar{" "}
                <span className="font-medium text-heading">{formatIdr(preview.amountIdr)}</span> (dibulatkan ke atas per Rp100, minimal Rp10.000).
              </>
            ) : (
              "Isi nilai diskon yang valid untuk melihat pratinjau."
            )}
          </p>
        </div>
      </Card>
      </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="h-10 px-4 text-sm font-semibold">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Buat promo
        </Button>
        <FormResult error={state.error} ok={state.ok} />
      </div>
    </form>
  );
}

/** One row's "Hentikan": a confirmation dialog before "Hentikan sekarang" submits. */
export function StopPromoDialog({ promoId, name }: { promoId: number; name: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AdminFormState, FormData>(async (prev, fd) => {
    const next = await stopPromoAction(prev, fd);
    if (next.ok) setOpen(false);
    return next;
  }, {});
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Hentikan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hentikan {name}?</DialogTitle>
          <DialogDescription>Promo tidak bisa dipakai lagi oleh order baru. Order yang sudah memegang pemakaian promo ini tetap berjalan sampai lunas atau kedaluwarsa.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="promoId" value={promoId} />
          <FormResult error={state.error} />
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={pending} className="h-10 px-4 text-sm font-semibold">
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Hentikan sekarang
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
