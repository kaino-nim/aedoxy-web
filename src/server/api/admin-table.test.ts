import { beforeEach, describe, expect, it, vi } from "vitest";

const access = vi.hoisted(() => ({ kind: "ok" as string }));
vi.mock("@/server/admin", () => ({ getAdminAccess: async () => ({ kind: access.kind }) }));

import { adminTableResponse } from "./admin-table";

const spec = { sortable: ["createdAt"], filters: { role: ["user", "admin"] } } as const;
const req = (qs = "") => new Request(`http://localhost/api/admin/x${qs}`);

describe("adminTableResponse", () => {
  beforeEach(() => {
    access.kind = "ok";
  });

  it("answers a bare 404 and never runs the query for anyone but an admin with 2FA", async () => {
    for (const kind of ["anonymous", "forbidden", "needs_2fa"]) {
      access.kind = kind;
      const run = vi.fn();
      const res = await adminTableResponse(req(), spec, run);
      expect(res.status).toBe(404);
      expect(await res.text()).toBe("");
      expect(run).not.toHaveBeenCalled();
    }
  });

  it("passes the validated query to the loader and returns uncached JSON", async () => {
    const run = vi.fn(async () => ({ rows: [{ id: 1 }], total: 41 }));
    const res = await adminTableResponse(req("?page=3&pageSize=9999&sort=passwordHash&role=root&dir=asc"), spec, run);
    expect(run).toHaveBeenCalledWith({ page: 3, pageSize: 100, sort: null, q: undefined, filters: {} });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ rows: [{ id: 1 }], total: 41, page: 3, pageSize: 100 });
  });

  it("hides internal errors behind a generic 500", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await adminTableResponse(req(), spec, async () => {
      throw new Error("relation does not exist");
    });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("relation");
    spy.mockRestore();
  });
});
