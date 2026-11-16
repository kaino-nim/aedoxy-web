import { Check, CreditCard, KeyRound, Mail, UserPlus } from "lucide-react";
import { formatIdr, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan } from "@/server/catalog/types";

/** Decorative arrow between two steps. The path is drawn on scroll by MarketingMotion (`data-draw`); without JS it simply shows. */
function Connector({ vertical }: { vertical?: boolean }) {
  return vertical ? (
    <svg aria-hidden viewBox="0 0 16 40" className="absolute top-full left-1/2 h-10 w-4 -translate-x-1/2 text-primary-ink lg:hidden" fill="none">
      <path data-draw pathLength={1} d="M8 2 V36 M3 31 L8 37 L13 31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden viewBox="0 0 64 16" className="absolute top-[38px] left-full hidden h-4 w-16 text-primary-ink lg:block" fill="none">
      <path data-draw pathLength={1} d="M4 8 H60 M54 3 L60 8 L54 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The demo cards are illustrations: inert and hidden from assistive tech. */
export function StepsSection({ plan }: { plan: Plan | null }) {
  const steps = [
    {
      title: "Daftar akun",
      text: "Daftar dengan email dan password atau akun Google. Satu akun berlaku untuk situs dan console API.",
      chip: "daftar",
      icon: UserPlus,
      demo: (
        <div className="space-y-2.5">
          <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line-strong text-sm font-semibold text-heading">
            <Mail className="size-4" aria-hidden /> Lanjut dengan email
          </div>
          <div className="flex h-10 items-center justify-center rounded-lg border border-line-strong text-sm font-semibold text-heading">
            Lanjut dengan Google
          </div>
          <p className="pt-1 text-center font-mono text-[11px] text-faint">satu akun · dua layanan</p>
        </div>
      ),
    },
    {
      title: "Pilih paket dan bayar",
      text: "Pilih paket mingguan atau bulanan, lalu bayar dengan QRIS atau Virtual Account. Kredit masuk setelah pembayaran terkonfirmasi.",
      chip: "bayar",
      icon: CreditCard,
      demo: (
        <div>
          <div className="flex gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-primary-ink/30 bg-primary-tint px-2 py-1 text-primary-ink">QRIS</span>
            <span className="rounded-md border border-line px-2 py-1 text-fg-soft">Virtual Account</span>
          </div>
          {plan && (
            <>
              <p className="mt-4 text-3xl font-medium tracking-[-0.03em] text-heading">{formatIdr(plan.priceIdr)}</p>
              <p className="mt-1 font-mono text-[11px] text-faint">
                Contoh · {plan.name} {formatUsd(plan.creditUsd)}
              </p>
            </>
          )}
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-2.5 py-1 font-mono text-[11px] text-primary-ink">
            <Check className="size-3" aria-hidden /> kredit aktif
          </p>
        </div>
      ),
    },
    {
      title: "Buat API key",
      text: "Buka console, buat key, tempel ke SDK atau agen Anda, lalu kirim request pertama.",
      chip: "pakai",
      icon: KeyRound,
      highlight: true,
      demo: (
        <div>
          <p className="mono-label">AEDOXY_API_KEY</p>
          <div className="mt-2 flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2.5 font-mono text-sm text-fg">
            <span>sk-••••••••••••</span>
            <span className="rounded bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">Salin</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="section-rule">
      <div className="container-x py-14 sm:py-20">
        <div data-rise>
          <p className="eyebrow">Mulai</p>
          <h2 className="mt-4 text-[34px] leading-[1.08] font-medium tracking-[-0.035em] text-heading sm:text-5xl">
            Dari nol ke API key
            <br />
            <span className="text-fg-muted">dalam tiga langkah.</span>
          </h2>
        </div>

        <ol className="mt-10 grid gap-14 sm:mt-12 lg:grid-cols-3 lg:gap-16">
          {steps.map((s, i) => (
            <li
              key={s.title}
              data-rise
              className={cn(
                "relative flex flex-col rounded-card-lg p-5 sm:p-6",
                s.highlight ? "grad-border" : "border border-line bg-surface shadow-card",
              )}
            >
              <div className="flex items-center gap-3" aria-hidden>
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl",
                    s.highlight ? "bg-primary text-primary-foreground" : "bg-primary-tint text-primary-ink",
                  )}
                >
                  <s.icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-faint">0{i + 1}</span>
                <span className="ml-auto rounded-full border border-line-strong px-2 py-0.5 font-mono text-[11px] text-fg-muted">{s.chip}</span>
              </div>
              <h3 className="mt-5 text-[22px] font-medium tracking-[-0.02em] text-heading">
                <span className="sr-only">Langkah {i + 1}: </span>
                {s.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{s.text}</p>
              <div className="mt-6 flex flex-1 flex-col justify-end">
                <div aria-hidden inert className="rounded-xl border border-line bg-surface-2 p-4 sm:p-5">
                  {s.demo}
                </div>
              </div>
              {i < steps.length - 1 && (
                <>
                  <Connector />
                  <Connector vertical />
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
