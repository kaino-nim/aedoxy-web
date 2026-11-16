import { formatIdr } from "@/lib/format";
import type { DayPoint } from "@/lib/day-buckets";

const dayFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });
const label = (date: string) => dayFmt.format(new Date(`${date}T00:00:00Z`));

/**
 * Daily bar chart in plain SVG (same approach as Sparkline: no chart library for one chart type). One bar per day,
 * brand orange, value in a native tooltip (<title>) and in a screen-reader table; days without data stay as empty slots.
 * `showAmount` adds the rupiah paid that day to the tooltip and summary.
 */
export function DayBarChart({ points, title, unit, showAmount = false }: { points: DayPoint[]; title: string; unit: string; showAmount?: boolean }) {
  const total = points.reduce((s, p) => s + p.count, 0);
  const amount = points.reduce((s, p) => s + p.amountIdr, 0);
  const max = Math.max(1, ...points.map((p) => p.count));
  const W = 600;
  const H = 120;
  const slot = W / points.length;
  const summary = `${total} ${unit} dalam ${points.length} hari${showAmount ? `, ${formatIdr(amount)}` : ""}`;

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 4}`} role="img" aria-label={`${title}: ${summary}`} className="h-36 w-full">
        <line x1={0} x2={W} y1={H + 1} y2={H + 1} stroke="var(--line-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => {
          const h = p.count === 0 ? 0 : Math.max(3, (p.count / max) * (H - 6));
          return (
            <g key={p.date}>
              <title>{`${label(p.date)}: ${p.count} ${unit}${showAmount ? `, ${formatIdr(p.amountIdr)}` : ""}`}</title>
              <rect x={i * slot} y={0} width={slot} height={H} fill="transparent" />
              <rect x={i * slot + slot * 0.18} y={H - h} width={slot * 0.64} height={h} rx={1.5} fill="var(--primary)" />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-between gap-x-4 font-mono text-xs text-faint">
        <span>{label(points[0].date)}</span>
        <span>{summary}</span>
        <span>{label(points[points.length - 1].date)}</span>
      </figcaption>
      {total === 0 && <p className="mt-2 text-sm text-fg-muted">Belum ada data pada periode ini.</p>}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">{unit}</th>
            {showAmount && <th scope="col">Rupiah</th>}
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <th scope="row">{label(p.date)}</th>
              <td>{p.count}</td>
              {showAmount && <td>{formatIdr(p.amountIdr)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Pool split as one stacked bar (available / reserved / sold) with a legend; values are quota already converted to dollars by the caller. */
export function PoolBar({ parts }: { parts: { label: string; value: number; text: string; className: string }[] }) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0);
  if (total <= 0) return <p className="text-sm text-fg-muted">Pool belum punya stok.</p>;
  return (
    <figure>
      <div role="img" aria-label={`Komposisi pool: ${parts.map((p) => `${p.label} ${p.text}`).join(", ")}`} className="flex h-4 overflow-hidden rounded-full bg-line">
        {parts.map((p) => (
          <span key={p.label} className={p.className} style={{ width: `${(Math.max(0, p.value) / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span aria-hidden className={`size-2.5 rounded-full ${p.className}`} />
            <span className="text-fg-muted">{p.label}</span>
            <span className="font-mono text-heading">{p.text}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
