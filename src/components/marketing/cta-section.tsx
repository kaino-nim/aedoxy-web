import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { SessionCta } from "./session-cta";

export function CtaSection() {
  return (
    <section className="container-x pb-20 sm:pb-28">
      <div data-rise className="grad-border relative overflow-hidden rounded-[22px]">
        {/* Decorative pixel-art skyline (public/art/cta-skyline.svg); its left edge fades into the card so the copy stays readable. */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 hidden w-3/5 bg-cover bg-bottom bg-no-repeat [mask-image:linear-gradient(to_right,transparent,#000_55%)] md:block"
          style={{ backgroundImage: "url(/art/cta-skyline.svg)" }}
        />
        <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:py-24">
          <h2 className="max-w-xl text-[44px] leading-[1.02] font-medium tracking-[-0.045em] text-heading sm:text-6xl lg:text-7xl">
            Request pertama
            <br />
            hari ini.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-fg-muted md:text-fg-soft">
            Pilih paket, bayar dengan QRIS, lalu buat API key di console.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SessionCta
              label="Dapatkan API key"
              href={site.links.register}
              icon={<ArrowUpRight className="size-4" aria-hidden />}
              className="h-[52px] min-w-[12.5rem] justify-center px-6 text-base font-semibold"
            />
            <Button asChild variant="outline" className="h-[52px] bg-surface px-6 text-base font-semibold">
              <Link href="/pricing">Lihat paket</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
