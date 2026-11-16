"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { ProviderLogo } from "@/components/brand/provider-logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { highlightLine } from "@/lib/highlight";
import { buildSnippet, SNIPPET_LANGS, type SnippetLang } from "@/lib/snippets";
import { cn } from "@/lib/utils";

export type SampleModel = { id: string; providerId: string | null };

/** Hero window: model list, tabbed code sample (python/node/curl) with copy, and the example response. */
export function CodePanel({ apiBaseUrl, models, fallbackModel }: { apiBaseUrl: string; models: SampleModel[]; fallbackModel: string }) {
  const [lang, setLang] = useState<SnippetLang>("python");
  const [model, setModel] = useState(models[0]?.id ?? fallbackModel);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildSnippet(lang, apiBaseUrl, model));
      setCopied(true);
    } catch {
      // Clipboard API unavailable (insecure context or denied): leave the label unchanged.
    }
  }

  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-t-[14px] border border-b-0 border-line bg-surface text-left shadow-card-hover",
        models.length > 0 && "lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_17rem]",
      )}
    >
      {models.length > 0 && (
        <div className="border-b border-line lg:row-span-2 lg:border-r lg:border-b-0 xl:row-span-1">
          <p className="flex h-11 items-center px-4 text-xs text-faint lg:border-b lg:border-line">Model</p>
          <ToggleGroup
            type="single"
            spacing={1}
            value={model}
            onValueChange={(v) => v && setModel(v)}
            aria-label="Pilih model untuk contoh kode"
            className="w-full flex-wrap px-2 pb-2 lg:flex-col lg:items-stretch lg:pt-2"
          >
            {models.map((m) => (
              <ToggleGroupItem
                key={m.id}
                value={m.id}
                className="h-10 min-w-0 justify-start gap-2.5 rounded-md px-2.5 font-mono text-xs font-normal text-fg-muted hover:bg-alt hover:text-heading data-[state=on]:bg-primary-tint data-[state=on]:text-primary-ink data-[state=on]:hover:bg-primary-tint"
              >
                {m.providerId && <ProviderLogo id={m.providerId} name={m.providerId} size={16} />}
                <span className="truncate">{m.id}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      <Tabs value={lang} onValueChange={(v) => setLang(v as SnippetLang)} className="min-w-0 gap-0">
        <div className="flex h-11 items-center justify-between border-b border-line px-2 sm:px-3">
          <TabsList variant="line" className="h-11 gap-0 p-0">
            {SNIPPET_LANGS.map((l) => (
              <TabsTrigger key={l} value={l} className="h-11 flex-none rounded-none px-3 font-mono text-[13px] after:bottom-0">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button type="button" variant="ghost" onClick={copy} className="h-9 gap-1.5 px-2.5 font-mono text-xs text-fg-muted">
            {copied ? <Check className="text-primary-ink" data-icon="inline-start" aria-hidden /> : <Copy data-icon="inline-start" aria-hidden />}
            {copied ? "Disalin" : "Salin"}
            <span className="sr-only" aria-live="polite">
              {copied ? "Kode disalin ke clipboard" : ""}
            </span>
          </Button>
        </div>
        {SNIPPET_LANGS.map((l) => {
          const lines = buildSnippet(l, apiBaseUrl, model).split("\n");
          return (
            <TabsContent key={l} value={l} className="m-0 overflow-x-auto py-4">
              <pre translate="no" className="min-w-max font-mono text-[13px] leading-[21px] text-fg">
                {lines.map((text, i) => (
                  <code key={i} className={cn("block px-4", text.includes(model) && "bg-primary-tint")}>
                    <span aria-hidden className="mr-4 inline-block w-4 text-right text-faint select-none">
                      {i + 1}
                    </span>
                    {highlightLine(text)}
                    {"\n"}
                  </code>
                ))}
              </pre>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className={cn("border-t border-line bg-surface-2", models.length > 0 && "lg:col-start-2 xl:col-start-auto xl:border-t-0 xl:border-l")}>
        <div className="flex h-11 items-center gap-3 border-b border-line px-4 font-mono text-xs text-fg-muted">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            200 OK
          </span>
          <span>streaming</span>
          <span className="ml-auto rounded border border-line-strong px-1.5 py-px text-[10px] text-faint">Contoh</span>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <p className="font-mono text-xs text-faint">
            model: <span className="text-fg-soft">{model}</span>
          </p>
          <p className="text-[15px] leading-relaxed text-fg">
            Halo! Ada yang bisa saya bantu? <span className="cursor-blink text-fg" aria-hidden />
          </p>
        </div>
      </div>
    </div>
  );
}
