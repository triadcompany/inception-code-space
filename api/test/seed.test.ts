import { afterEach, beforeEach, expect, test } from "vitest";
import { body, setupTest, type TestCtx } from "./helpers.ts";

let ctx: TestCtx;
beforeEach(async () => {
  ctx = await setupTest();
});
afterEach(() => ctx.close());

test("0001_seed populates site_config and paginas", async () => {
  const cfg = await body<any[]>(await ctx.request("/api/site-config"));
  expect(cfg.map((r) => r.key).sort()).toEqual(["contato", "site", "sobre"]);

  const pag = await body<any[]>(await ctx.request("/api/paginas"));
  expect(pag.map((r) => r.slug).sort()).toEqual([
    "20-anos",
    "cultos-especiais",
    "o-inicio",
    "sobre",
  ]);

  const site = await body<any>(await ctx.request("/api/site-config/site"));
  expect(site.value.nome).toBe("Tabernáculo");
});
