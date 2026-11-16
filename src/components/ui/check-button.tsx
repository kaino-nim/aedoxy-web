import { Check } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Checkbox drawn as a button. The native input stays (visually hidden, `peer`), so name/value, form submission, keyboard
 * (Space), label and `aria-checked` semantics are the browser's own; the label draws the button and `has-checked` the
 * active primary state. Without `icon` a check mark appears when checked; with `icon` that icon is always shown, and
 * `checkedIcon` (optional) replaces it while checked. Works controlled or uncontrolled, like a normal input.
 */
export function CheckButton({
  icon,
  checkedIcon,
  children,
  className,
  ...input
}: Omit<React.ComponentProps<"input">, "type" | "children" | "className"> & {
  icon?: React.ReactNode;
  checkedIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-sm whitespace-nowrap text-fg-soft transition-colors select-none hover:bg-muted [&_svg]:size-4 [&_svg]:shrink-0",
        "has-checked:border-primary has-checked:bg-primary has-checked:font-semibold has-checked:text-primary-foreground has-checked:hover:bg-primary/90",
        "has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className,
      )}
    >
      <input type="checkbox" {...input} className="peer sr-only" />
      {icon ? (
        <>
          <span aria-hidden className={cn("inline-flex", checkedIcon && "peer-checked:hidden")}>
            {icon}
          </span>
          {checkedIcon && (
            <span aria-hidden className="hidden peer-checked:inline-flex">
              {checkedIcon}
            </span>
          )}
        </>
      ) : (
        <Check aria-hidden className="hidden peer-checked:block" />
      )}
      {children}
    </label>
  );
}
