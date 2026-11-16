import Link from "next/link";
import { site } from "@/config/site";
import { getCopyrightYear, getSiteSettings } from "@/server/site";

const WORDMARK_TEXT = {
  x: 0,
  y: 200,
  fontSize: 290,
  fontWeight: 500,
  letterSpacing: -12,
  textLength: 1000,
  lengthAdjust: "spacing",
} as const;
const WORDMARK_FADE = "linear-gradient(to bottom, #000 45%, rgba(0, 0, 0, 0.12) 100%)";
const WORDMARK_FONT = { fontFamily: "var(--font-geist-sans), system-ui, sans-serif" };

/**
 * Giant decorative wordmark. textLength pins it to the full container width at any viewport.
 * Pale neutral, faded out toward the bottom edge; the orange layer fades in on hover (pointer devices only,
 * Tailwind wraps `hover:` variants in `@media (hover: hover)`), so touch screens keep the neutral mark.
 */
function Wordmark({ name }: { name: string }) {
  return (
    <div aria-hidden className="group select-none" style={{ maskImage: WORDMARK_FADE, WebkitMaskImage: WORDMARK_FADE }}>
      <svg viewBox="0 0 1000 275" className="block w-full">
        <defs>
          <linearGradient id="wordmark-hover" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={{ stopColor: "var(--primary)" }} />
            <stop offset="1" style={{ stopColor: "var(--accent)" }} />
          </linearGradient>
        </defs>
        <text {...WORDMARK_TEXT} style={{ ...WORDMARK_FONT, fill: "var(--wordmark)" }}>
          {name}
        </text>
        <text
          {...WORDMARK_TEXT}
          className="opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none"
          style={{ ...WORDMARK_FONT, fill: "url(#wordmark-hover)" }}
        >
          {name}
        </text>
      </svg>
    </div>
  );
}

export async function SiteFooter() {
  const [s, year] = await Promise.all([getSiteSettings(), getCopyrightYear()]);
  const contacts: { href: string; label: string }[] = [];
  if (s.supportEmail) contacts.push({ href: `mailto:${s.supportEmail}`, label: s.supportEmail });
  if (s.whatsappUrl) contacts.push({ href: s.whatsappUrl, label: "WhatsApp" });
  if (s.telegramUrl) contacts.push({ href: s.telegramUrl, label: "Telegram" });

  return (
    <footer className="section-rule mt-auto overflow-hidden">
      <div className="container-x pt-10 pb-8 md:pt-14">
        <div>
          <Wordmark name={s.brandName} />
        </div>
        <div className="mt-2 flex flex-col gap-4 text-[13px] text-fg-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {s.companyName || s.brandName}. Hak cipta dilindungi. Console API ditenagai{" "}
            <a
              href="https://github.com/Calcium-Ion/new-api"
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-2 hover:text-fg"
            >
              New API
            </a>
            .
          </p>
          <div className="flex flex-col gap-3 md:items-end">
            {contacts.length > 0 && (
              <nav aria-label="Kontak">
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {contacts.map((c) => (
                    <li key={c.href}>
                      <a href={c.href} rel="noopener noreferrer" target={c.href.startsWith("mailto:") ? undefined : "_blank"} className="hover:text-fg hover:underline">
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {site.legal.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-fg hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
