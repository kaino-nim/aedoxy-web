"use client";

import { useState, type ReactNode } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { matchesTab, PERIOD_TABS, parsePeriodTab, type PeriodTab, type PlanCategory } from "@/lib/plan-category";

export type PlanGridItem = { id: number; category: PlanCategory; node: ReactNode };

/** Period tabs over the plan cards. Filtering happens here, in the browser; the choice lands in `?periode=` without a navigation. */
export function PlanGrid({ items, initialTab }: { items: PlanGridItem[]; initialTab: PeriodTab }) {
  const [tab, setTab] = useState<PeriodTab>(initialTab);

  function select(value: string) {
    const next = parsePeriodTab(value);
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("periode");
    else url.searchParams.set("periode", next);
    window.history.replaceState(window.history.state, "", url);
  }

  return (
    <Tabs value={tab} onValueChange={select} className="gap-4">
      {/* Button Group as the tablist: the Radix list/trigger keep role, aria-selected and arrow-key navigation, the Buttons draw them. */}
      <TabsPrimitive.List asChild>
        <ButtonGroup aria-label="Periode paket">
          {PERIOD_TABS.map((t) => (
            <TabsPrimitive.Trigger key={t.value} value={t.value} asChild>
              <Button variant={tab === t.value ? "default" : "outline"} className="h-9 px-4 text-sm">
                {t.label}
              </Button>
            </TabsPrimitive.Trigger>
          ))}
        </ButtonGroup>
      </TabsPrimitive.List>
      {PERIOD_TABS.map((t) => {
        const shown = items.filter((item) => matchesTab(item.category, t.value));
        return (
          <TabsContent key={t.value} value={t.value}>
            {shown.length === 0 ? (
              <Card>
                <CardContent className="text-sm text-fg-muted">{t.empty}</CardContent>
              </Card>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {shown.map((item) => (
                  <li key={item.id} className="flex">
                    {item.node}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
