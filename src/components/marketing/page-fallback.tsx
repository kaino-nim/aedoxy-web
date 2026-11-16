/** Suspense fallback for marketing pages: reserves the first screen while the page streams so nothing below it jumps. Cached data is already in the static shell and never shows this. */
export function PageFallback() {
  return <div aria-hidden className="min-h-svh" />;
}