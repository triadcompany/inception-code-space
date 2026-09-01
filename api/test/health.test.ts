import { afterEach, beforeEach, expect, test } from "vitest";
import { setupTest, type TestCtx } from "./helpers.ts";

let ctx: TestCtx;
beforeEach(async () => {
  ctx = await setupTest();
});
afterEach(() => ctx.close());

test("GET /api/health returns ok", async () => {
  const res = await ctx.request("/api/health");
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});

test("unknown route returns 404 JSON", async () => {
  const res = await ctx.request("/api/nope");
  expect(res.status).toBe(404);
  expect(await res.json()).toEqual({ error: "Não encontrado" });
});
