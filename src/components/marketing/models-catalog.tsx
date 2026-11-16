"use client";

import { Brain, Check, Copy, FileText, ImageIcon, Search, Type, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProviderLogo } from "@/components/brand/provider-logo";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FxFootnote } from "@/components/usd-idr";
import { formatMTokens, formatTokens } from "@/lib/format";
import { formatPrice, type Currency } from "@/lib/fx";
import { filterModels, savingPercent, sortModels, tokensPerUsd, type ModelSort } from "@/lib/models";
import { cn } from "@/lib/utils";
import type { Capability, FxRate, Model, ModelStatus, Provider } from "@/server/catalog/types";

const CAPABILITY: Record<Capability, { label: string; icon: LucideIcon }> = {
  text: { label: "Teks", icon: Type },
  image: { label: "Gambar", icon: ImageIcon },
  file: { label: "File", icon: FileText },
  reasoning: { label: "Reasoning", icon: Brain },
};

const STATUS: Record<ModelStatus, { label: string; dot: string }> = {
  active: { label: "Aktif", dot: "bg-success" },
  degraded: { label: "Terganggu", dot: "bg-warn" },
  offline: { label: "Offline", dot: "bg-danger" },
};

const SORTS: { value: ModelSort; label: string }[] = [
  { value: "name", label: "Urut: A → Z" },
  { value: "price-asc", label: "Biaya termurah" },
  { value: "price-desc", label: "Biaya termahal" },
  { value: "context", label: "Context terbesar" },
];

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable || target.closest('[role="combobox"], [role="listbox"]') !== null)
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-11 w-full rounded-lg data-[size=default]:h-11 border-line-strong bg-surface py-0 pr-3 pl-3.5 text-sm text-fg-soft hover:bg-surface dark:bg-surface dark:hover:bg-surface", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className="rounded-xl bg-surface shadow-card-hover">
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-fg-soft">
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function ModelsCatalog({
  providers,
  models,
  fx,
}: {
  providers: Provider[];
  models: Model[];
  fx: FxRate | null;
}) {
  const [query, setQuery] = useState("");
  const [providerId, setProviderId] = useState("all");
  const [capability, setCapability] = useState<Capability | "all">("all");
  const [status, setStatus] = useState<ModelStatus | "all">("all");
  const [sort, setSort] = useState<ModelSort>("name");
  const [currency, setCurrency] = useState<Currency>("usd");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const idrAvailable = fx !== null && fx.showConversion;
  const showIdr = currency === "idr" && idrAvailable;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !isTyping(e.target)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (copiedId === null) return;
    const id = setTimeout(() => setCopiedId(null), 1500);
    return () => clearTimeout(id);
  }, [copiedId]);

  async function copy(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
    } catch {
      // Clipboard unavailable; nothing to confirm.
    }
  }

  const perProvider = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of models) counts.set(m.providerId, (counts.get(m.providerId) ?? 0) + 1);
    return counts;
  }, [models]);

  const groups = useMemo(() => {
    const visible = sortModels(filterModels(models, { query, providerId, capability, status }), sort);
    return providers
      .map((provider) => ({ provider, models: visible.filter((m) => m.providerId === provider.id) }))
      .filter((g) => g.models.length > 0);
  }, [models, providers, query, providerId, capability, status, sort]);
  const shown = groups.reduce((n, g) => n + g.models.length, 0);

  // Every price column (provider list price and credit cost) goes through the same USD/IDR helper.
  const price = (usd: number) => formatPrice(usd, currency, fx);

  // Cell bodies shared by the table (>= xl) and the cards (below xl), so both show the same figures.
  const nameCell = (m: Model) => (
    <div className="flex min-w-0 items-center gap-1.5">
      <span translate="no" className="min-w-0 font-mono text-sm [overflow-wrap:anywhere] text-heading">
        {m.id}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => copy(m.id)}
            aria-label={`Salin nama model ${m.id}`}
            className="text-faint hover:text-heading"
          >
            {copiedId === m.id ? <Check className="text-primary-ink" aria-hidden /> : <Copy aria-hidden />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copiedId === m.id ? "Disalin" : "Salin nama model"}</TooltipContent>
      </Tooltip>
    </div>
  );
  const contextCell = (m: Model) =>
    m.contextIn === null ? (
      <span className="text-faint">–</span>
    ) : (
      <>
        <span className="font-semibold text-heading">{formatTokens(m.contextIn)}</span> <span className="text-primary-ink">in</span>
        {m.contextOut !== null && <span className="block text-faint">{formatTokens(m.contextOut)} out</span>}
      </>
    );
  const capabilitiesCell = (m: Model) => (
    <ul className="flex gap-1.5">
      {m.capabilities.map((c) => {
        const { label, icon: Icon } = CAPABILITY[c];
        return (
          <li key={c} title={label} className="grid size-7 place-items-center rounded-md bg-alt text-fg-muted">
            <Icon className="size-3.5" aria-hidden />
            <span className="sr-only">{label}</span>
          </li>
        );
      })}
    </ul>
  );
  const statusCell = (m: Model) => (
    <span className="inline-flex items-center gap-2 text-[13px] text-fg-soft">
      <span className={cn("size-2 rounded-full", STATUS[m.status].dot)} aria-hidden />
      {STATUS[m.status].label}
    </span>
  );
  const officialCell = (m: Model) => {
    const saving = savingPercent(m);
    return m.officialInputUsdPerM !== null && m.officialOutputUsdPerM !== null ? (
      <>
        <s className="text-faint">
          <span className="sr-only">Harga resmi </span>
          {price(m.officialInputUsdPerM)} / {price(m.officialOutputUsdPerM)}
        </s>
        {saving !== null && <span className="block text-primary-ink" title="Dihitung dengan asumsi 3 token input untuk tiap 1 token output, dolar dengan dolar; harga paket tidak ikut dihitung.">hemat {saving}%</span>}
      </>
    ) : (
      <span className="text-faint">–</span>
    );
  };
  const creditCell = (m: Model) =>
    m.creditInputUsdPerM !== null && m.creditOutputUsdPerM !== null ? (
      <>
        <span className="text-sm font-semibold text-heading">{price(m.creditInputUsdPerM)}</span> <span className="text-faint">in</span>
        <span className="block text-fg-soft">
          {price(m.creditOutputUsdPerM)} <span className="text-faint">out</span>
        </span>
        {m.creditDynamic && <span className="block text-[11px] text-fg-muted">harga saat ini</span>}
      </>
    ) : m.creditPerRequestUsd !== null ? (
      <>
        <span className="text-sm font-semibold text-heading">{price(m.creditPerRequestUsd)}</span> <span className="text-faint">/ request</span>
      </>
    ) : (
      <span className="text-faint">–</span>
    );
  const perUsdCell = (m: Model) => {
    const t = tokensPerUsd(m);
    if (t === null) return <span className="text-faint">-</span>;
    if (t.unit === "request") return `${new Intl.NumberFormat("id-ID").format(t.count)} request`;
    return (
      <>
        <span className="text-fg-soft">{formatMTokens(t.input)}</span> <span className="text-faint">in</span>
        <span className="block text-fg-soft">
          {formatMTokens(t.output)} <span className="text-faint">out</span>
        </span>
      </>
    );
  };

  function reset() {
    setQuery("");
    setProviderId("all");
    setCapability("all");
    setStatus("all");
  }

  const head = "h-auto px-4 py-3 text-xs font-normal whitespace-normal text-faint";

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <aside className="flex flex-col gap-3 lg:sticky lg:top-28 lg:max-h-[calc(100svh-8rem)] lg:self-start lg:overflow-y-auto" aria-label="Filter katalog">
        <div role="search">
          <label className="relative block">
            <span className="sr-only">Cari model</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-muted" aria-hidden />
            <Input
              ref={searchRef}
              type="search"
              name="q"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari model…"
              className="h-11 rounded-lg border-line-strong bg-surface py-0 pr-10 pl-10 text-sm text-fg placeholder:text-faint dark:bg-surface"
            />
            <kbd aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-line-strong px-1.5 font-mono text-[11px] text-faint">
              /
            </kbd>
          </label>
        </div>

        <FilterSelect
          label="Provider"
          value={providerId}
          onChange={setProviderId}
          options={[{ value: "all", label: "Semua provider" }, ...providers.map((p) => ({ value: p.id, label: p.name }))]}
          className="lg:hidden"
        />

        <ToggleGroup
          type="single"
          spacing={1}
          value={providerId}
          onValueChange={(v) => v && setProviderId(v)}
          aria-label="Filter provider"
          className="hidden w-full lg:mt-3 lg:flex lg:flex-col lg:items-stretch"
        >
          {[{ id: "all", name: "Semua provider" }, ...providers].map((p) => (
            <ToggleGroupItem
              key={p.id}
              value={p.id}
              className="h-10 justify-start gap-2.5 rounded-md px-2.5 text-sm font-normal text-fg-soft hover:bg-alt hover:text-heading data-[state=on]:bg-primary-tint data-[state=on]:font-medium data-[state=on]:text-primary-ink data-[state=on]:hover:bg-primary-tint"
            >
              {p.id === "all" ? (
                <span aria-hidden className="size-4" />
              ) : (
                <ProviderLogo id={p.id} name={p.name} size={16} />
              )}
              <span className="truncate">{p.name}</span>
              <span className="ml-auto font-mono text-xs text-faint tabular-nums">{p.id === "all" ? models.length : (perProvider.get(p.id) ?? 0)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </aside>

      <div className="min-w-0">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          <FilterSelect
            label="Kemampuan"
            className="col-span-2 md:col-span-1"
            value={capability}
            onChange={setCapability}
            options={[
              { value: "all", label: "Semua kemampuan" },
              ...(Object.keys(CAPABILITY) as Capability[]).map((c) => ({ value: c, label: CAPABILITY[c].label })),
            ]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "Semua status" },
              ...(Object.keys(STATUS) as ModelStatus[]).map((s) => ({ value: s, label: STATUS[s].label })),
            ]}
          />
          <FilterSelect label="Urutkan" value={sort} onChange={setSort} options={SORTS} />
          {idrAvailable && (
            <ToggleGroup
              type="single"
              spacing={1}
              value={currency}
              onValueChange={(v) => v && setCurrency(v as Currency)}
              aria-label="Mata uang harga"
              className="col-span-2 h-11 w-full rounded-lg border border-line-strong bg-surface p-1 font-mono text-xs md:col-span-1"
            >
              {(["usd", "idr"] as const).map((c) => (
                <ToggleGroupItem
                  key={c}
                  value={c}
                  className="h-full flex-1 rounded-md px-3.5 text-fg-muted uppercase hover:bg-transparent data-[state=on]:bg-alt data-[state=on]:font-semibold data-[state=on]:text-heading"
                >
                  {c}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </div>

        <p aria-live="polite" className="mt-5 font-mono text-xs text-fg-muted">
          {shown} dari {models.length} model
        </p>

        <div className="mt-4 flex flex-col gap-6">
          {groups.length === 0 && (
            <Empty className="rounded-card-lg border border-solid border-line bg-surface p-10">
              <EmptyHeader>
                <EmptyTitle className="text-base text-heading">Tidak ada model yang cocok.</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" variant="link" onClick={reset} className="h-11 px-2 font-semibold text-primary-ink">
                  Reset filter
                </Button>
              </EmptyContent>
            </Empty>
          )}
          {groups.map(({ provider, models: rows }) => {
            const inputs = rows.flatMap((m) => (m.creditInputUsdPerM === null ? [] : [m.creditInputUsdPerM]));
            const from = inputs.length > 0 ? Math.min(...inputs) : null;
            return (
              <section
                key={provider.id}
                aria-labelledby={`provider-${provider.id}`}
                className="overflow-hidden rounded-card-lg border border-line bg-surface"
              >
                <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-surface-2 px-4 py-4 sm:px-5">
                  <span className="grid size-10 place-items-center rounded-lg border border-line bg-surface">
                    <ProviderLogo id={provider.id} name={provider.name} size={22} />
                  </span>
                  <h2 id={`provider-${provider.id}`} className="text-xl font-medium tracking-[-0.02em] text-heading">
                    {provider.name}
                  </h2>
                  <p className="font-mono text-xs text-fg-muted sm:ml-auto">
                    {rows.length} model{from !== null && ` · mulai ${price(from)} / 1M`}
                  </p>
                </header>

                <div className="hidden min-w-0 overflow-x-auto xl:block">
                  {/* Fixed widths keep the columns lined up from one provider's table to the next. */}
                  <Table className="min-w-[760px] table-fixed text-left">
                    <TableCaption className="sr-only">Model {provider.name}</TableCaption>
                    <TableHeader>
                      <TableRow className="border-line hover:bg-transparent">
                        <TableHead className={cn(head, "w-[30%]")}>Model · status</TableHead>
                        <TableHead className={cn(head, "w-[11%]")}>Context</TableHead>
                        <TableHead className={cn(head, "w-[15%]")}>Kemampuan</TableHead>
                        <TableHead className={cn(head, "w-[16%] text-right")}>Resmi · in / out</TableHead>
                        <TableHead className={cn(head, "w-[13%] text-right")}>Biaya kredit / 1M</TableHead>
                        <TableHead className={cn(head, "w-[16%] text-right")}>≈ Token per $1 kredit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((m) => (
                        <TableRow key={m.id} className="border-line hover:bg-surface-2">
                          <TableCell className="px-4 py-3 whitespace-normal">
                            {nameCell(m)}
                            <span className="mt-0.5 block">{statusCell(m)}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3 font-mono text-xs leading-5 whitespace-nowrap">{contextCell(m)}</TableCell>
                          <TableCell className="px-4 py-3 whitespace-normal">{capabilitiesCell(m)}</TableCell>
                          <TableCell className="px-4 py-3 text-right font-mono text-xs leading-5 whitespace-nowrap">{officialCell(m)}</TableCell>
                          <TableCell className="px-4 py-3 text-right font-mono text-xs leading-5 whitespace-nowrap">{creditCell(m)}</TableCell>
                          <TableCell className="px-4 py-3 text-right font-mono text-xs leading-5 whitespace-nowrap">{perUsdCell(m)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <ul className="-mb-px grid min-w-0 [overflow-wrap:anywhere] md:grid-cols-2 xl:hidden" aria-label={`Model ${provider.name}`}>
                  {rows.map((m) => (
                    <li key={m.id} className="flex flex-col gap-3 border-b border-line px-4 py-4 md:odd:border-r">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        {nameCell(m)}
                        {statusCell(m)}
                      </div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-xs leading-5">
                        <div>
                          <dt className="text-[11px] text-faint">Biaya kredit / 1M</dt>
                          <dd className="mt-1">{creditCell(m)}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-faint">Resmi · in / out</dt>
                          <dd className="mt-1">{officialCell(m)}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-faint">Context</dt>
                          <dd className="mt-1">{contextCell(m)}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-faint">Kemampuan</dt>
                          <dd className="mt-1">{m.capabilities.length > 0 ? capabilitiesCell(m) : <span className="text-faint">–</span>}</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-[11px] text-faint">≈ Token per $1 kredit</dt>
                          <dd className="mt-1">{perUsdCell(m)}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {showIdr && <FxFootnote fx={fx} className="mt-6" />}
      </div>
    </div>
  );
}
