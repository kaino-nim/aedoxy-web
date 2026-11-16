import { ArrowUpRight, Landmark, Layers, QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { formatIdr } from "@/lib/format";
import { cheapestPlan, periodUnit } from "@/lib/plans";
import { DEFAULT_SAMPLE_MODEL } from "@/lib/schemas/site";
import type { Model, Plan, Provider } from "@/server/catalog/types";
import { CodePanel } from "./code-panel";
import { SessionCta } from "./session-cta";

const PAYMENT_NOTES = [
  { icon: QrCode, label: "QRIS" },
  { icon: Landmark, label: "Virtual Account" },
  { icon: Layers, label: "Satu paket aktif per akun" },
];

export function Hero({ plans, models, providers, apiBaseUrl, sampleModel }: { plans: Plan[]; models: Model[]; providers: Provider[]; apiBaseUrl: string; sampleModel: string }) {
  const cheapest = cheapestPlan(plans);
  // First model of up to four different providers, for the model list in the window.
  const catalogModels = providers.flatMap((p) => models.find((m) => m.providerId === p.id)?.id ?? []);
  // A model the admin chose in /admin/settings leads the examples; the built-in placeholder never displaces a real model.
  const featured = (sampleModel === DEFAULT_SAMPLE_MODEL ? catalogModels : [sampleModel, ...catalogModels.filter((m) => m !== sampleModel)])
    .slice(0, 4)
    .map((id) => ({ id, providerId: models.find((m) => m.id === id)?.providerId ?? null }));

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="container-x flex flex-col items-center pt-12 text-center sm:pt-16 lg:pt-20">
        <div className="hero-enter flex flex-col items-center">
          {cheapest && (
            <Link
              href="#paket"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-mono text-[13px] text-fg-soft underline-offset-4 hover:underline"
            >
              <span className="font-semibold text-primary-ink">
                Mulai {formatIdr(cheapest.priceIdr)} / {periodUnit(cheapest)}
              </span>
              <span aria-hidden className="text-faint">·</span>
              harga flat
            </Link>
          )}
          <h1
            id="hero-title"
            className="mt-4 max-w-[16ch] text-[44px] leading-[1.02] font-medium tracking-[-0.045em] text-balance text-grad sm:text-6xl lg:text-[76px]"
          >
            Satu API key.
            <br />
            Semua model AI.
          </h1>
          <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.65] text-pretty text-fg-muted sm:text-lg">
            Ganti satu base URL, lalu panggil Claude, GPT, Gemini, DeepSeek, dan model lain. Berlangganan paket berharga flat dalam
            rupiah, bayar dengan QRIS atau Virtual Account.
          </p>
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <SessionCta
              label="Dapatkan API key"
              href={site.links.register}
              icon={<ArrowUpRight data-icon="inline-end" aria-hidden />}
              className="h-12 min-w-[12.5rem] justify-center px-6 text-base font-semibold"
            />
            <Button asChild variant="outline" className="h-12 bg-surface px-6 text-base font-semibold">
              <Link href="/models">Lihat model</Link>
            </Button>
          </div>
          <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-fg-muted">
            {PAYMENT_NOTES.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-faint" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-enter hero-enter-late hero-ground mt-12 w-full rounded-t-[22px] px-3 pt-3 sm:mt-14 sm:px-8 sm:pt-10 lg:px-12 lg:pt-12">
          <div className="mx-auto max-w-[70rem]">
            <CodePanel apiBaseUrl={apiBaseUrl} models={featured} fallbackModel={sampleModel} />
          </div>
        </div>
      </div>
      {/* Replaces the hard bottom border: the orange frame and the window's lower edge dissolve into the next section's background. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-bg sm:h-28" />
    </section>
  );
}
