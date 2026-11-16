import { describe, expect, it } from "vitest";
import { formatMTokens } from "./format";
import { formatPrice } from "./fx";
import { tokensPerUsd } from "./models";
import type { FxRate, Model } from "@/server/catalog/types";

const fx: FxRate = { rate: 18_000, source: "test", sourceDate: "2026-11-01", fetchedAt: "2026-11-01T00:00:00Z", roundingStepIdr: 100, showConversion: true };

const model = (over: Partial<Model> = {}): Model => ({
  id: "m",
  providerId: "p",
  contextIn: null,
  contextOut: null,
  capabilities: [],
  status: "active",
  officialInputUsdPerM: null,
  officialOutputUsdPerM: null,
  creditInputUsdPerM: null,
  creditOutputUsdPerM: null,
  creditPerRequestUsd: null,
  creditDynamic: false,
  ...over,
});

describe("formatPrice (shared by the official and credit-cost columns)", () => {
  it("shows USD by default and when IDR is unavailable", () => {
    expect(formatPrice(0.3, "usd", fx)).toBe("$0.30");
    expect(formatPrice(0.3, "idr", null)).toBe("$0.30");
    expect(formatPrice(0.3, "idr", { ...fx, showConversion: false })).toBe("$0.30");
  });
  it("converts with the given rate and rounding step", () => {
    expect(formatPrice(0.3, "idr", fx)).toBe("Rp5.400");
    expect(formatPrice(10, "idr", { ...fx, rate: 18_149 })).toBe("Rp181.500");
    expect(formatPrice(10, "idr", { ...fx, rate: 18_149, roundingStepIdr: 1 })).toBe("Rp181.490");
  });
  it("does not show a positive amount as Rp0", () => {
    expect(formatPrice(0.001, "idr", fx)).toBe("< Rp100");
    expect(formatPrice(0, "idr", fx)).toBe("Rp0");
  });
});

describe("tokensPerUsd", () => {
  it("is 1 / price per 1M for input and output, in millions of tokens", () => {
    expect(tokensPerUsd(model({ creditInputUsdPerM: 0.5, creditOutputUsdPerM: 4 }))).toEqual({ unit: "token", input: 2, output: 0.25 });
  });
  it("keeps one side when the other price is zero or missing", () => {
    expect(tokensPerUsd(model({ creditInputUsdPerM: 0, creditOutputUsdPerM: 5 }))).toEqual({ unit: "token", input: null, output: 0.2 });
  });
  it("falls back to requests per $1 for fixed-price models", () => {
    expect(tokensPerUsd(model({ creditPerRequestUsd: 0.04 }))).toEqual({ unit: "request", count: 25 });
  });
  it("returns null for unknown, zero, negative or non-finite prices", () => {
    expect(tokensPerUsd(model())).toBeNull();
    expect(tokensPerUsd(model({ creditInputUsdPerM: 0, creditOutputUsdPerM: 0 }))).toBeNull();
    expect(tokensPerUsd(model({ creditInputUsdPerM: -1, creditOutputUsdPerM: Number.NaN }))).toBeNull();
    expect(tokensPerUsd(model({ creditPerRequestUsd: Number.POSITIVE_INFINITY }))).toBeNull();
  });
});

describe("formatMTokens", () => {
  it("uses Indonesian separators and an M suffix", () => {
    expect(formatMTokens(12.5)).toBe("12,5 M");
    expect(formatMTokens(0.25)).toBe("0,25 M");
    expect(formatMTokens(2)).toBe("2 M");
    expect(formatMTokens(1234.4)).toBe("1.234 M");
  });
  it("shows - for missing or invalid values and a floor for tiny ones", () => {
    expect(formatMTokens(null)).toBe("-");
    expect(formatMTokens(0)).toBe("-");
    expect(formatMTokens(Number.NaN)).toBe("-");
    expect(formatMTokens(Number.POSITIVE_INFINITY)).toBe("-");
    expect(formatMTokens(0.001)).toBe("< 0,01 M");
  });
});
