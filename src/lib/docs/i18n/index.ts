import { id } from "./id";
import type { DocsDict } from "./types";

export type { DocsDict };

export type DictVars = { brand: string; envKey: string };

/** Replaces `{brand}` / `{envKey}` in every string of the dictionary. Unknown `{x}` stay as written. */
export function fillDict<T>(value: T, vars: DictVars): T {
  if (typeof value === "string") {
    return value.replace(/\{(brand|envKey)\}/g, (_, k: keyof DictVars) => vars[k]) as T;
  }
  if (Array.isArray(value)) return value.map((v) => fillDict(v, vars)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillDict(v, vars)])) as T;
  }
  return value;
}

export function getDict(vars: DictVars): DocsDict {
  return fillDict(id, vars);
}
