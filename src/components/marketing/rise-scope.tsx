"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { shouldHide, type RiseGeometry } from "@/lib/rise";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** First rescue pass: whatever is still hidden but cannot (or no longer needs to) wait for a scroll appears now. */
const RESCUE_MS = 1500;
/** Last resort: nothing stays hidden longer than this, whatever ScrollTrigger did. */
const REVEAL_ALL_MS = 6000;
/** Layout settling (streamed content, fonts, images) triggers one refresh + rescue after this quiet period. */
const SETTLE_MS = 200;

const geometry = (el: Element): Omit<RiseGeometry, "docTop"> & { docTop: number } => ({
  docTop: el.getBoundingClientRect().top + window.scrollY,
  viewportH: window.innerHeight,
  docHeight: document.documentElement.scrollHeight,
  scrollY: window.scrollY,
});

/**
 * Scroll entrances for the markup inside it: `data-rise` (fade + rise, staggered per batch) and `data-draw`
 * (SVG path draws itself). Nothing is hidden until the effect runs, and nothing runs under prefers-reduced-motion,
 * so content is always visible.
 *
 * Fail-safe by design: an element is hidden only when scrolling can really bring it to the trigger line (`shouldHide`),
 * so short or non-scrollable pages never hide anything. The layout is watched, ScrollTrigger is refreshed when it
 * settles (streamed content, fonts), a rescue pass reveals whatever is hidden yet reachable or in view, and a final
 * timer reveals everything left, so no element can stay invisible if a trigger never fires.
 *
 * Wrap the content of ONE Suspense/streaming boundary (a page). The effect runs only after this component has
 * committed, and the markup it animates is part of the same hydration unit, so GSAP never writes inline styles into
 * server HTML that React has not hydrated yet. Mount and unmount re-run it, so route changes replay the entrances and
 * cleanup reverts every tween, trigger and inline style.
 * The footer is deliberately NOT animated: legal links and contact details must always be visible.
 */
export function RiseScope({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pending = new Set<HTMLElement>();
        const reveal = (els: HTMLElement[]) => {
          const live = els.filter((el) => pending.delete(el));
          if (live.length === 0) return;
          gsap.to(live, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.08, overwrite: true, clearProps: "opacity,transform" });
        };

        const hidden = gsap.utils.toArray<HTMLElement>("[data-rise]", scope).filter((el) => shouldHide(geometry(el)));
        gsap.set(hidden, { opacity: 0, y: 20 });
        for (const el of hidden) pending.add(el);
        ScrollTrigger.batch(hidden, { start: "top 92%", once: true, onEnter: (batch) => reveal(batch as HTMLElement[]) });

        for (const path of gsap.utils.toArray<SVGGeometryElement>("[data-draw]", scope)) {
          if (!path.ownerSVGElement?.getClientRects().length) continue; // the connector variant hidden at this breakpoint
          gsap.fromTo(
            path,
            { strokeDasharray: 1, strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut", clearProps: "strokeDasharray,strokeDashoffset", scrollTrigger: { trigger: path, start: "top 90%", once: true } },
          );
        }

        // Rescue: anything still hidden that is in view now, or that scrolling can no longer bring to the trigger line.
        const rescue = () => {
          if (pending.size === 0) return;
          reveal([...pending].filter((el) => !el.isConnected || !shouldHide(geometry(el))));
        };

        // Layout shifts after mount (Suspense content, fonts, images) move the trigger positions: recompute them.
        let settle: ReturnType<typeof setTimeout> | undefined;
        const onLayout = () => {
          clearTimeout(settle);
          settle = setTimeout(() => {
            ScrollTrigger.refresh();
            rescue();
          }, SETTLE_MS);
        };
        const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onLayout);
        observer?.observe(document.body);
        void document.fonts?.ready.then(onLayout);

        const rescueTimer = setTimeout(rescue, RESCUE_MS);
        const lastResort = setTimeout(() => reveal([...pending]), REVEAL_ALL_MS);

        return () => {
          observer?.disconnect();
          clearTimeout(settle);
          clearTimeout(rescueTimer);
          clearTimeout(lastResort);
          pending.clear();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // `contents` keeps the wrapper out of the layout.
  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}
