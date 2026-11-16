import { cn } from "@/lib/utils";

/**
 * Small pixel-art icons for the admin summary cards, drawn as <rect>s on a 12x12 grid (same crisp style as the SVGs in
 * public/art). Characters: "#" brand orange, "o" light orange, "d" dark orange, "." empty. Decorative (aria-hidden).
 */
const ICONS = {
  // receipt with a zig-zag edge: paid orders
  order: [
    "............",
    "..########..",
    "..#oooooo#..",
    "..########..",
    "..#oooooo#..",
    "..########..",
    "..#oooo#o#..",
    "..########..",
    "..#oooooo#..",
    "..#o#o#o##..",
    "..##.#.#.#..",
    "............",
  ],
  // coin: revenue
  coin: [
    "............",
    "....####....",
    "...#oooo#...",
    "..#oo##ooo#.",
    "..#o#dd##o#.",
    "..#o##d.#o#.",
    "..#o#dd##o#.",
    "..#oo##ooo#.",
    "...#oooo#...",
    "....####....",
    "............",
    "............",
  ],
  // person: new users
  user: [
    "............",
    "....####....",
    "...######...",
    "...######...",
    "....####....",
    "............",
    "..########..",
    ".##########.",
    ".##oooooo##.",
    ".##########.",
    ".##########.",
    "............",
  ],
  // battery: credit pool
  pool: [
    "............",
    "............",
    ".##########.",
    ".#oooooooo#.",
    ".#o####ooo##",
    ".#o####ooo##",
    ".#o####ooo##",
    ".#oooooooo#.",
    ".##########.",
    "............",
    "............",
    "............",
  ],
  // warning triangle: failed fulfillment
  alert: [
    "............",
    ".....##.....",
    "....####....",
    "....#dd#....",
    "...##dd##...",
    "...##dd##...",
    "..###dd###..",
    "..########..",
    ".####dd####.",
    ".##########.",
    "............",
    "............",
  ],
  // shield with a check: pool invariant
  shield: [
    "............",
    "...######...",
    "..########..",
    "..#oooooo#..",
    "..#ooooo##..",
    "..#od#oo#o..",
    "..#oo#d#o#..",
    "..#ooo#ooo..",
    "...#oooo#...",
    "....####....",
    ".....##.....",
    "............",
  ],
} as const;

const FILL = { "#": "#ff9f1c", o: "#ffd9a0", d: "#c25e00" } as const;

export type PixelIconName = keyof typeof ICONS;

export function PixelIcon({ name, className }: { name: PixelIconName; className?: string }) {
  const rows = ICONS[name];
  return (
    <svg aria-hidden viewBox="0 0 12 12" shapeRendering="crispEdges" className={cn("size-10 shrink-0", className)}>
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (ch in FILL ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={FILL[ch as keyof typeof FILL]} /> : null)),
      )}
    </svg>
  );
}
