"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Smooth scroll (Lenis, driven by the GSAP ticker) for the marketing layout only. Renders its children untouched
 * and writes no style to any element React renders; entrances live in `RiseScope`, inside each streamed boundary.
 */
export function MarketingMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The docs pages have their own in-page scrolling (sidebar, anchors) and stay native.
  const smooth = !pathname.startsWith("/docs");

  // Native hash scrolling (Next + CSS scroll-padding) is left alone, so anchors and the sticky header behave as before.
  useGSAP(
    () => {
      if (!smooth) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lenis = new Lenis({
          autoRaf: false,
          anchors: false,
          // Scrollable overlays keep their native wheel/touch scrolling.
          prevent: (node) => !!node.closest('[role="dialog"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper]'),
        });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // Radix dialogs and sheets lock the body; the page behind must not scroll meanwhile.
        const sync = () => (document.body.hasAttribute("data-scroll-locked") ? lenis.stop() : lenis.start());
        const observer = new MutationObserver(sync);
        observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
        sync();

        return () => {
          observer.disconnect();
          gsap.ticker.remove(tick);
          gsap.ticker.lagSmoothing(500, 33);
          lenis.destroy();
        };
      });
      return () => mm.revert();
    },
    { dependencies: [smooth], revertOnUpdate: true },
  );

  return <>{children}</>;
}
