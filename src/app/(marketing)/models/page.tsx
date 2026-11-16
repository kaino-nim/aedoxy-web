import { ExternalLink, Info } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFallback } from "@/components/marketing/page-fallback";
import { ModelsCatalog } from "@/components/marketing/models-catalog";
import { RiseScope } from "@/components/marketing/rise-scope";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { env } from "@/env";
import { resolveModelPricingUrl } from "@/lib/schemas/site";
import { getCatalog, getFxRate } from "@/server/catalog";
import { getSiteSettings } from "@/server/site";

export const metadata: Metadata = {
  title: "Katalog model",
  description: "Daftar model per provider, context, kemampuan, dan biaya kredit per 1 juta token.",
};

export default function ModelsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Models />
    </Suspense>
  );
}

async function Models() {
  const [{ providers, models, state }, fx, settings] = await Promise.all([getCatalog(), getFxRate(), getSiteSettings()]);
  // Saved in /admin/settings; empty falls back to the console's own /pricing. Only https URLs are ever rendered.
  const pricingUrl = resolveModelPricingUrl(settings.modelPricingUrl, env.NEWAPI_PUBLIC_URL);

  return (
    <RiseScope>
      <section className="border-b border-line">
        <div className="container-x grid gap-8 py-14 sm:py-20 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div data-rise className="lg:col-span-7">
            <dl className="flex gap-5 font-mono text-[13px] text-fg-muted">
              <div className="flex flex-row-reverse gap-1.5">
                <dt>model</dt>
                <dd className="font-semibold text-heading tabular-nums">{models.length}</dd>
              </div>
              <div className="flex flex-row-reverse gap-1.5">
                <dt>provider</dt>
                <dd className="font-semibold text-heading tabular-nums">{providers.length}</dd>
              </div>
            </dl>
            <h1 className="mt-5 text-[44px] leading-none font-medium tracking-[-0.045em] text-heading sm:text-6xl lg:text-7xl">Katalog model</h1>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-fg-muted">
              Jelajahi model per provider, kemampuannya, dan biaya kredit per 1 juta token. Satu API key untuk semuanya.
            </p>
          </div>
          <div data-rise className="flex flex-col items-start gap-3 lg:col-span-5">
            <Alert>
              <Info aria-hidden />
              <AlertDescription>
                Harga resmi: harga list provider per 1 juta token (input / output). Biaya kredit: yang dipotong dari kredit paket Anda, dalam dolar; tombol IDR hanya
                estimasi dengan kurs di bawah tabel. Token per $1 kredit: jumlah juta token yang didapat dari $1 kredit.
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="h-10 px-4 text-sm font-semibold text-white bg-primary hover:bg-primary/70 hover:text-white">
              <a href={pricingUrl} target="_blank" rel="noopener noreferrer">
                Lihat harga lengkap
                <ExternalLink aria-hidden />
                <span className="sr-only"> (buka di tab baru)</span>
              </a>
            </Button>
          </div>
        </div>
      </section>
      <section className="container-x py-10 sm:py-12">
        {state === "stale" && (
          <Alert variant="warning" role="status" className="mb-6">
            <AlertDescription className="text-fg-soft">
              Data harga terbaru belum bisa dimuat. Daftar di bawah adalah data terakhir yang berhasil diambil.
            </AlertDescription>
          </Alert>
        )}
        {models.length === 0 ? (
          <Empty className="rounded-card-lg border border-solid border-line bg-surface p-10">
            <EmptyHeader>
              <EmptyTitle className="text-base text-heading">Daftar model belum tersedia.</EmptyTitle>
              <EmptyDescription>
                {state === "unavailable" ? "Data model belum bisa dimuat saat ini. Coba lagi beberapa saat lagi." : "Belum ada model yang ditampilkan."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ModelsCatalog providers={providers} models={models} fx={fx} />
        )}
      </section>
    </RiseScope>
  );
}
