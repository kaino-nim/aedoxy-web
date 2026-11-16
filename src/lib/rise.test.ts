import { describe, expect, it } from "vitest";
import { shouldHide } from "./rise";

const base = { viewportH: 1000, scrollY: 0 };

describe("shouldHide", () => {
  it("does not hide what is already in view or above the fold", () => {
    expect(shouldHide({ ...base, docTop: 100, docHeight: 4000 })).toBe(false);
    expect(shouldHide({ ...base, docTop: 920, docHeight: 4000 })).toBe(false); // exactly on the trigger line
  });

  it("hides an element far below the fold on a long page", () => {
    expect(shouldHide({ ...base, docTop: 2500, docHeight: 4000 })).toBe(true);
  });

  it("never hides on a page that cannot scroll (the footer bug)", () => {
    // 1000px document in a 1000px viewport: max scroll is 0, so an element at 950px can never reach the trigger line.
    expect(shouldHide({ ...base, docTop: 950, docHeight: 1000 })).toBe(false);
    expect(shouldHide({ ...base, docTop: 1500, docHeight: 1000 })).toBe(false);
  });

  it("never hides an element that can barely reach the trigger line", () => {
    // Max scroll 100: the element ends at viewport top 940 > 850, too close to the edge to be safe.
    expect(shouldHide({ ...base, docTop: 1040, docHeight: 1100 })).toBe(false);
    // Max scroll 300: viewport top 800 at the bottom, comfortably above the trigger line.
    expect(shouldHide({ ...base, docTop: 1100, docHeight: 1300 })).toBe(true);
  });

  it("uses the current scroll position for what is in view", () => {
    expect(shouldHide({ viewportH: 1000, scrollY: 2000, docTop: 2500, docHeight: 4000 })).toBe(false);
    expect(shouldHide({ viewportH: 1000, scrollY: 2000, docTop: 3300, docHeight: 6000 })).toBe(true);
  });

  it("keeps footer-like elements at the end of a long page visible", () => {
    // Last 60px of a 3000px page: at max scroll (2000) its viewport top is 940, so it would never pass the trigger line safely.
    expect(shouldHide({ ...base, docTop: 2940, docHeight: 3000 })).toBe(false);
  });
});
