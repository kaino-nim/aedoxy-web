import { QrCode } from "lucide-react";
import Link from "next/link";
import { ProviderLogo } from "@/components/brand/provider-logo";
import { UsdIdr } from "@/components/usd-idr";
import { formatIdr, formatUsd } from "@/lib/format";
import { periodUnit } from "@/lib/plans";
import { DEFAULT_SAMPLE_MODEL } from "@/lib/schemas/site";
import { cn } from "@/lib/utils";
import type { FxRate, Model, Plan, Provider } from "@/server/catalog/types";

const kindOf = (m: Model) => (m.capabilities.includes("reasoning") ? "REASONING" : m.capabilities.includes("image") ? "VISION" : "CHAT");

const ART_FADE = "linear-gradient(to bottom, #000 35%, transparent 85%)";

/** One bento tile: rounded white card, copy first, its own visual underneath. */
function Tile({ title, body, className, children }: { title: string; body: React.ReactNode; className?: string; children?: React.ReactNode }) {
  return (
    <article data-rise className={cn("flex min-w-0 flex-col rounded-card-lg border border-line bg-surface p-5 shadow-card sm:p-7", className)}>
      <h3 className="text-xl font-medium tracking-[-0.02em] text-heading">{title}</h3>
      <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-fg-muted">{body}</p>
      {children}
    </article>
  );
}

export function PlatformSection({
  models,
  providers,
  plan,
  fx,
  brandName,
}: {
  brandName: string;
  models: Model[];
  providers: Provider[];
  plan: Plan | null;
  fx: FxRate | null;
}) {
  const sample = providers.flatMap((p) => models.find((m) => m.providerId === p.id) ?? []).slice(0, 6);
  const branches = providers.slice(0, 3);
  // Real models first; with an empty catalogue, clearly labelled placeholder rows keep the card from being blank.
  const pills =
    sample.length > 0
      ? sample.map((m) => ({ id: m.id, providerId: m.providerId, label: kindOf(m) }))
      : Array.from({ length: 3 }, (_, i) => ({ id: DEFAULT_SAMPLE_MODEL, providerId: providers[i]?.id ?? "model", label: "CONTOH" }));

  return (
    <section className="section-rule" aria-labelledby="platform-title">
      <div className="container-x py-14 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2
            id="platform-title"
            data-rise
            className="text-[34px] leading-[1.08] font-medium tracking-[-0.035em] text-heading sm:text-5xl lg:col-span-7"
          >
            Satu pintu masuk.
            <br />
            <span className="text-fg-muted">Banyak model di belakangnya.</span>
          </h2>
          <p data-rise className="max-w-md text-[17px] leading-[1.65] text-fg-muted lg:col-span-5 lg:justify-self-end">
            {brandName} meneruskan request Anda ke provider yang tepat dan memotong kredit dari satu paket aktif. Tidak ada akun atau
            tagihan terpisah untuk tiap provider.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 lg:grid-cols-12">
          <Tile
            title="Satu katalog, dua format"
            body="Panggil model dengan format OpenAI Chat Completions atau Anthropic Messages, sesuai yang sudah dipakai kode Anda."
            className={plan ? "lg:col-span-5 lg:row-span-2" : "lg:col-span-12"}
          >
            {/* Orange wash that fades into the card surface, with a stack of white model pills on top. */}
            <div className="relative isolate mt-6 flex flex-1 flex-col justify-end gap-5 overflow-hidden rounded-xl bg-linear-to-b from-primary-tint to-surface p-3 pt-24 sm:p-5 sm:pt-32">
              {/* Decorative ordered-dither mosaic (public/art/catalog-dither.svg); its cells thin out toward the pills. */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-cover bg-top bg-no-repeat"
                style={{ backgroundImage: "url(/art/catalog-dither.svg)", maskImage: ART_FADE, WebkitMaskImage: ART_FADE }}
              />
              <ul className="flex flex-wrap gap-2 font-mono text-xs font-medium text-primary-ink">
                {["OpenAI Chat Completions", "Anthropic Messages"].map((f) => (
                  <li key={f} className="rounded-full border border-primary-ink/30 bg-surface px-2.5 py-1">
                    {f}
                  </li>
                ))}
              </ul>
              <ul className="flex flex-col gap-2">
                {pills.map((m, i) => (
                  <li
                    key={`${m.id}-${i}`}
                    className="flex h-12 min-w-0 items-center gap-3 rounded-full border border-line bg-surface pr-4 pl-3.5 shadow-card"
                  >
                    <ProviderLogo id={m.providerId} name={m.providerId} size={20} />
                    <span className="truncate font-mono text-sm text-fg">{m.id}</span>
                    <span className="ml-auto font-mono text-[10px] text-faint">{m.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Tile>

          {plan && (
            <Tile
              title="Satu paket, semua provider"
              body="Semua model memotong kredit dari paket yang sama. Satu akun hanya punya satu paket aktif."
              className="lg:col-span-7"
            >
              <p className="mt-5 text-xs text-faint">Contoh paket aktif</p>
              <dl className="mt-1 grid gap-x-10 text-sm sm:grid-cols-2">
                <div className="divide-y divide-line">
                  <Row term="Paket" detail={`${plan.name} · ${formatUsd(plan.creditUsd)} kredit`} />
                  <Row term="Masa aktif" detail={`${plan.durationDays} hari`} />
                </div>
                <div className="divide-y divide-line border-t border-line sm:border-t-0">
                  <Row
                    term="Kredit"
                    detail={
                      <span className="flex flex-col items-end">
                        {formatUsd(plan.creditUsd)}
                        <UsdIdr usd={plan.creditUsd} fx={fx} />
                      </span>
                    }
                  />
                  <Row term="Sisa kredit" detail="hangus di akhir masa aktif" />
                </div>
              </dl>
            </Tile>
          )}

          {plan && (
            <Tile
              title="Harga flat dalam rupiah"
              body="Yang Anda bayar adalah harga paket, bukan hasil hitung kurs. Estimasi rupiah dari kredit dolar hanya keterangan."
              className="lg:col-span-7"
            >
              <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs text-faint">Bayar sekali per periode</p>
                  <p className="mt-2 text-5xl leading-none font-medium tracking-[-0.045em] text-heading tabular-nums">{formatIdr(plan.priceIdr)}</p>
                  <p className="mt-2 font-mono text-xs text-faint">
                    / {periodUnit(plan)} · {formatUsd(plan.creditUsd)} kredit
                  </p>
                </div>
                <ul className="flex flex-wrap gap-2 text-xs">
                  {["QRIS", "Virtual Account"].map((m) => (
                    <li key={m} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-fg-soft">
                      <QrCode className="size-3.5" aria-hidden />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </Tile>
          )}

          {/* TODO(owner): state prompt-retention facts here once confirmed; only HTTPS is claimed for now. */}
          <Tile
            title="Alur request yang sederhana"
            className="lg:col-span-12"
            body={
              <>
                Request dikirim lewat HTTPS ke gateway {brandName}, lalu diteruskan ke provider model.{" "}
                <Link href="/privacy" className="text-primary-ink underline underline-offset-2">
                  Baca Kebijakan Privasi
                </Link>
                .
              </>
            }
          >
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-10">
              <dl className="grid grid-cols-3 divide-x divide-line">
                {[
                  ["Dalam transit", "HTTPS"],
                  ["Sisa kredit", "Hangus di akhir"],
                  ["Paket aktif", "Satu per akun"],
                ].map(([k, v]) => (
                  <div key={k} className="px-3 first:pl-0 last:pr-0 sm:px-4">
                    <dt className="text-xs text-faint">{k}</dt>
                    <dd className="mt-1.5 text-[15px] leading-snug font-medium text-heading sm:text-lg">{v}</dd>
                  </div>
                ))}
              </dl>
              <div
                role="img"
                aria-label={`Alur request: aplikasi Anda, lewat HTTPS, ke gateway ${brandName}, lalu ke provider model`}
                className="route flex items-center font-mono text-xs text-fg-soft"
              >
                <span aria-hidden className="shrink-0 rounded-md border border-line bg-surface-2 px-2.5 py-2">
                  Aplikasi Anda
                </span>
                <span aria-hidden className="flex min-w-8 flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] text-faint">HTTPS</span>
                  <span className="route-line relative h-px w-full" />
                </span>
                <span aria-hidden className="shrink-0 rounded-md border border-primary-ink/40 bg-primary-tint px-2.5 py-2 text-primary-ink">
                  {brandName}
                </span>
                <span aria-hidden className="route-line relative h-px w-5 shrink-0 sm:w-8" />
                <span aria-hidden className="relative flex flex-col gap-2">
                  {branches.length > 1 && <span className="route-line route-line-y absolute top-[18px] bottom-[18px] left-0 w-px" />}
                  {(branches.length > 0 ? branches : [{ id: "provider", name: "Provider" }]).map((p) => (
                    <span key={p.id} className="flex h-9 items-center">
                      <span className="route-line relative h-px w-3 shrink-0 sm:w-4" />
                      <span className="flex h-9 items-center gap-2 rounded-md border border-line bg-surface-2 px-2.5">
                        <ProviderLogo id={p.id} name={p.name} size={14} />
                        <span className="hidden sm:inline">{p.name}</span>
                      </span>
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Row({ term, detail }: { term: string; detail: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-fg-muted">{term}</dt>
      <dd className="text-right font-medium text-fg">{detail}</dd>
    </div>
  );
}
