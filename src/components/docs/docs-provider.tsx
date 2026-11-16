"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getDict, type DocsDict } from "@/lib/docs/i18n";
import { brandEnvKey, buildDocsSnippets, type DocsSnippets } from "@/lib/docs/snippets";

type Config = { gatewayUrl: string; apiKey: string; model: string };

type DocsContextValue = {
  t: DocsDict;
  config: Config;
  setConfig: (patch: Partial<Config>) => void;
  snippets: DocsSnippets;
  brandName: string;
};

const DocsContext = createContext<DocsContextValue | null>(null);

export function useDocs(): DocsContextValue {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error("useDocs must be used inside <DocsProvider>");
  return ctx;
}

/** Holds the (Indonesian) docs copy and the quick-configuration values. */
export function DocsProvider({ brandName, apiBaseUrl, sampleModel, children }: { brandName: string; apiBaseUrl: string; sampleModel: string; children: ReactNode }) {
  const [config, setFullConfig] = useState<Config>({ gatewayUrl: apiBaseUrl, apiKey: "", model: sampleModel });

  const value = useMemo<DocsContextValue>(() => {
    const envKey = brandEnvKey(brandName);
    return {
      t: getDict({ brand: brandName, envKey }),
      config,
      setConfig: (patch) => setFullConfig((c) => ({ ...c, ...patch })),
      snippets: buildDocsSnippets({ brandName, ...config, defaults: { gatewayUrl: apiBaseUrl, model: sampleModel } }),
      brandName,
    };
  }, [config, brandName, apiBaseUrl, sampleModel]);

  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>;
}
