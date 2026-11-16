import { describe, expect, it } from "vitest";
import { buildTableQuery, parseTableQuery } from "./table-query";

const spec = { sortable: ["createdAt", "email"], filters: { role: ["user", "admin"], actor: "text", from: "date" } } as const;
const parse = (qs: string) => parseTableQuery(new URLSearchParams(qs), spec);

describe("parseTableQuery", () => {
  it("applies defaults for an empty query", () => {
    expect(parse("")).toEqual({ page: 1, pageSize: 25, sort: null, q: undefined, filters: {} });
  });

  it("clamps pageSize to 100 and falls back for nonsense", () => {
    expect(parse("pageSize=500").pageSize).toBe(100);
    expect(parse("pageSize=0").pageSize).toBe(25);
    expect(parse("pageSize=abc").pageSize).toBe(25);
    expect(parse("pageSize=50").pageSize).toBe(50);
  });

  it("falls back to page 1 for invalid pages", () => {
    for (const p of ["0", "-3", "x", "1.5", "999999999"]) expect(parse(`page=${p}`).page).toBe(1);
    expect(parse("page=7").page).toBe(7);
  });

  it("only sorts by whitelisted columns", () => {
    expect(parse("sort=email&dir=asc").sort).toEqual({ id: "email", desc: false });
    expect(parse("sort=createdAt").sort).toEqual({ id: "createdAt", desc: true });
    expect(parse("sort=password&dir=asc").sort).toBeNull();
    expect(parse("sort=email;drop table&dir=asc").sort).toBeNull();
    expect(parse("sort=email&dir=sideways").sort).toEqual({ id: "email", desc: true });
  });

  it("validates filters per kind and trims search", () => {
    const q = parse("role=admin&actor=%20ayu%20&from=2026-11-01&q=%20budi%20");
    expect(q.filters).toEqual({ role: "admin", actor: "ayu", from: "2026-11-01" });
    expect(q.q).toBe("budi");
    expect(parse("role=root&from=yesterday&actor=").filters).toEqual({});
    expect(parse(`actor=${"a".repeat(300)}`).filters.actor).toHaveLength(100);
    expect(parse(`q=${"b".repeat(300)}`).q).toBeUndefined();
  });

  it("ignores filters the spec does not declare", () => {
    expect(parse("secret=1&role=user").filters).toEqual({ role: "user" });
  });
});

describe("buildTableQuery", () => {
  it("round-trips through parseTableQuery", () => {
    const params = buildTableQuery({ pageIndex: 2, pageSize: 50, sort: { id: "email", desc: false }, q: " ayu ", filters: { role: "admin", from: "" } });
    expect(params.toString()).toBe("page=3&pageSize=50&sort=email&dir=asc&q=ayu&role=admin");
    expect(parseTableQuery(params, spec)).toEqual({ page: 3, pageSize: 50, sort: { id: "email", desc: false }, q: "ayu", filters: { role: "admin" } });
  });
});
