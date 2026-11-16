import Link from "next/link";
import { ProviderLogo } from "@/components/brand/provider-logo";
import type { Provider } from "@/server/catalog/types";

/** Copies of the provider list per group, so one group is always wider than the viewport (about 190px per item). */
const MARQUEE_MIN_ITEMS = 14;

/**
 * Full-bleed divider between two home sections: one row of provider logos and names, scrolling right to left in a
 * seamless loop (pure CSS, transform only), faded at both viewport edges. It has no container padding, so it spans the
 * viewport; `overflow-x-clip` keeps the moving track from adding a horizontal scrollbar. The first group is the real
 * list; every repeat and the second group are aria-hidden and out of the tab order. Pauses on hover and focus; under
 * reduced motion it is a static, wrapping row (see `.marquee` in globals.css). Renders nothing without providers.
 */
export function ProviderMarquee({ providers }: { providers: Provider[] }) {
  if (providers.length === 0) return null;
  const repeats = Math.max(1, Math.ceil(MARQUEE_MIN_ITEMS / providers.length));
  const seconds = Math.min(45, Math.max(30, providers.length * repeats * 2.8));
  const group = (hidden: boolean) =>
    Array.from({ length: repeats }, (_, r) =>
      providers.map((p) => {
        const dup = hidden || r > 0;
        return (
          <li key={`${r}-${p.id}`} aria-hidden={dup || undefined} className={dup ? "marquee-dup" : undefined}>
            <Link
              href="/models"
              tabIndex={dup ? -1 : undefined}
              className="flex items-center gap-3 rounded-md text-lg font-medium whitespace-nowrap text-fg-muted transition-colors hover:text-heading"
            >
              <ProviderLogo id={p.id} name={p.name} size={28} />
              {p.name}
            </Link>
          </li>
        );
      }),
    );

  return (
    <section aria-label="Provider yang didukung" data-rise className="w-full overflow-x-clip border-y border-line py-5">
      <div className="marquee" style={{ "--marquee-duration": `${seconds}s` } as React.CSSProperties}>
        <div className="marquee-track flex h-16 w-max items-center">
          <ul className="marquee-group flex shrink-0 items-center gap-16 pr-16">{group(false)}</ul>
          <ul aria-hidden className="marquee-group marquee-dup flex shrink-0 items-center gap-16 pr-16">
            {group(true)}
          </ul>
        </div>
      </div>
    </section>
  );
}
