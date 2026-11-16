/**
 * Decisions for the scroll entrances (RiseScope), kept pure so they can be tested. The rule that matters: an element may
 * only be hidden while it is certain to be shown again, i.e. while scrolling can actually bring it to the trigger line.
 * Anything else (already in view, or too close to the end of a short or non-scrollable page) must stay visible.
 */

/** The entrance plays when the element's top reaches this fraction of the viewport height (ScrollTrigger "top 92%"). */
export const TRIGGER = 0.92;
/** Safety margin: the element must be able to pass the trigger line by this fraction of the viewport, not just touch it. */
const REACH_MARGIN = 0.07;

export type RiseGeometry = {
  /** Element top in document coordinates (viewport top + scrollY). */
  docTop: number;
  viewportH: number;
  /** document.documentElement.scrollHeight. */
  docHeight: number;
  scrollY: number;
};

/** True when the element starts below the trigger line AND scrolling to the very bottom would carry it above that line. */
export function shouldHide({ docTop, viewportH, docHeight, scrollY }: RiseGeometry): boolean {
  if (docTop - scrollY <= viewportH * TRIGGER) return false; // in view, or above: nothing to wait for
  const maxScroll = Math.max(0, docHeight - viewportH);
  return docTop - maxScroll <= viewportH * (TRIGGER - REACH_MARGIN);
}
