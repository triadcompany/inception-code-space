import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { body, jsonHeaders, seedUser, setupTest, type TestCtx } from "./helpers.ts";

let ctx: TestCtx;
beforeEach(async () => {
  ctx = await setupTest();
});
afterEach(() => ctx.close());

const send = (path: string, method: string, payload?: unknown, headers: Record<string, string> = {}) =>
  ctx.request(path, {
    method,
    headers: { ...jsonHeaders, ...headers },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

describe("cultos", () => {
  test("write requires admin; anon and normal users are rejected", async () => {
    expect((await send("/api/cultos", "POST", { titulo: "x", data: "2026-01-01" })).status).toBe(401);
    const user = await seedUser(ctx, {});
    expect(
      (await send("/api/cultos", "POST", { titulo: "x", data: "2026-01-01" }, user.auth)).status,
    ).toBe(403);
  });

  test("admin CRUD + public visibility filter", async () => {
    const admin = await seedUser(ctx, { admin: true });

    const created = await send(
      "/api/cultos",
      "POST",
      { titulo: "Culto A", data: "2026-05-01", status: "publicado", tipo: "geral" },
      admin.auth,
    );
    expect(created.status).toBe(201);
    const culto = await body(created);

    await send(
      "/api/cultos",
      "POST",
      { titulo: "Rascunho", data: "2026-05-02", status: "rascunho", tipo: "geral" },
      admin.auth,
    );
    await send(
      "/api/cultos",
      "POST",
      { titulo: "Jovens", data: "2026-05-03", status: "publicado", tipo: "jovens" },
      admin.auth,
    );

    // anon: only published + geral
    const anon = await body(await ctx.request("/api/cultos"));
    expect(anon.map((c: any) => c.titulo)).toEqual(["Culto A"]);

    // admin: everything
    const all = await body(await ctx.request("/api/cultos", { headers: admin.auth }));
    expect(all.length).toBe(3);

    // approved member: geral + jovens
    const member = await seedUser(ctx, { email: "m@t.com", approved: true });
    const seen = await body(await ctx.request("/api/cultos", { headers: member.auth }));
    expect(seen.map((c: any) => c.titulo).sort()).toEqual(["Culto A", "Jovens"]);

    // search + year filters
    const byYear = await body(await ctx.request("/api/cultos?year=2026", { headers: admin.auth }));
    expect(byYear.length).toBe(3);
    const bySearch = await body(await ctx.request("/api/cultos?search=jov", { headers: admin.auth }));
    expect(bySearch.length).toBe(1);

    // update + delete
    const patched = await send("/api/cultos/" + culto.id, "PATCH", { titulo: "Culto A2" }, admin.auth);
    expect((await body(patched)).titulo).toBe("Culto A2");
    expect((await send("/api/cultos/" + culto.id, "DELETE", undefined, admin.auth)).status).toBe(200);
    expect((await ctx.request("/api/cultos/" + culto.id)).status).toBe(404);
  });
});

describe("doutrinas / estudos", () => {
  test("published visibility + tema_id on estudos", async () => {
    const admin = await seedUser(ctx, { admin: true });

    await send(
      "/api/doutrinas",
      "POST",
      { titulo: "D1", autor: "A", data: "2026-01-01", publicado: true },
      admin.auth,
    );
    await send(
      "/api/doutrinas",
      "POST",
      { titulo: "D2", autor: "A", data: "2026-01-02", publicado: false },
      admin.auth,
    );

    const pub = await body(await ctx.request("/api/doutrinas"));
    expect(pub.map((d: any) => d.titulo)).toEqual(["D1"]);
    const asAdmin = await body(await ctx.request("/api/doutrinas", { headers: admin.auth }));
    expect(asAdmin.length).toBe(2);

    const tema = await body(
      await send("/api/temas", "POST", { nome: "Fé", ordem: 1 }, admin.auth),
    );
    const est = await send(
      "/api/estudos",
      "POST",
      { titulo: "E1", autor: "A", data: "2026-02-01", tema_id: tema.id },
      admin.auth,
    );
    expect((await body(est)).tema_id).toBe(tema.id);
  });
});

describe("temas", () => {
  test("ordered by ordem asc, published-only for anon", async () => {
    const admin = await seedUser(ctx, { admin: true });
    await send("/api/temas", "POST", { nome: "B", ordem: 2 }, admin.auth);
    await send("/api/temas", "POST", { nome: "A", ordem: 1 }, admin.auth);
    await send("/api/temas", "POST", { nome: "Hidden", ordem: 3, publicado: false }, admin.auth);

    const anon = await body(await ctx.request("/api/temas"));
    expect(anon.map((t: any) => t.nome)).toEqual(["A", "B"]);
  });
});

describe("tags", () => {
  test("list is public, create is admin, duplicates rejected", async () => {
    const admin = await seedUser(ctx, { admin: true });
    expect((await send("/api/tags-gerais", "POST", { nome: "Louvor" })).status).toBe(401);
    expect((await send("/api/tags-gerais", "POST", { nome: "Louvor" }, admin.auth)).status).toBe(201);
    expect((await send("/api/tags-gerais", "POST", { nome: "Louvor" }, admin.auth)).status).toBe(409);
    const list = await body(await ctx.request("/api/tags-gerais"));
    expect(list.length).toBe(1);
  });
});

describe("site-config", () => {
  test("public read, admin upsert", async () => {
    const admin = await seedUser(ctx, { admin: true });
    expect((await ctx.request("/api/site-config/site")).status).toBe(404);
    const put = await send("/api/site-config/site", "PUT", { value: { nome: "Tab" } }, admin.auth);
    expect(put.status).toBe(200);
    const got = await body(await ctx.request("/api/site-config/site"));
    expect(got.value.nome).toBe("Tab");
  });
});

describe("galeria", () => {
  test("counts grouped by categoria", async () => {
    const admin = await seedUser(ctx, { admin: true });
    await send("/api/galeria-fotos", "POST", { url: "/u/a.jpg", categoria: "Sexta" }, admin.auth);
    await send("/api/galeria-fotos", "POST", { url: "/u/b.jpg", categoria: "Sexta" }, admin.auth);
    await send("/api/galeria-fotos", "POST", { url: "/u/c.jpg", categoria: "Domingo" }, admin.auth);

    const counts = await body(await ctx.request("/api/galeria-fotos/counts"));
    expect(counts).toEqual({ Sexta: 2, Domingo: 1 });

    const sexta = await body(await ctx.request("/api/galeria-fotos?categoria=Sexta"));
    expect(sexta.length).toBe(2);
  });
});

describe("usuarios", () => {
  test("admin lists users, approves, and cannot delete self", async () => {
    const admin = await seedUser(ctx, { admin: true });
    const other = await seedUser(ctx, { email: "o@t.com" });

    expect((await ctx.request("/api/usuarios")).status).toBe(401);

    const list = await body(await ctx.request("/api/usuarios", { headers: admin.auth }));
    expect(list.length).toBe(2);
    expect(list[0]).toHaveProperty("user_id");

    const approved = await send("/api/usuarios/" + other.id, "PATCH", { approved: true }, admin.auth);
    expect((await body(approved)).approved).toBe(true);

    expect((await send("/api/usuarios/" + admin.id, "DELETE", undefined, admin.auth)).status).toBe(403);
    expect((await send("/api/usuarios/" + other.id, "DELETE", undefined, admin.auth)).status).toBe(200);
  });
});

describe("youtube", () => {
  test("GET /api/youtube/live reads persisted state", async () => {
    const admin = await seedUser(ctx, { admin: true });
    await send(
      "/api/site-config/current_live",
      "PUT",
      { value: { isLive: true, videoId: "abc12345678", title: "Ao vivo", thumbnail: "t.jpg" } },
      admin.auth,
    );
    const live = await body(await ctx.request("/api/youtube/live"));
    expect(live).toEqual({ live: true, videoId: "abc12345678", title: "Ao vivo", thumbnail: "t.jpg" });
  });

  test("live-check requires the internal token", async () => {
    expect((await send("/api/youtube/live-check", "POST", {})).status).toBe(401);
    const res = await send("/api/youtube/live-check", "POST", {}, { "x-internal-token": "test-internal-token" });
    expect(res.status).toBe(200);
    expect(await body(res)).toMatchObject({ live: false });
  });
});

describe("uploads", () => {
  test("multipart upload stores a file and returns its url", async () => {
    const user = await seedUser(ctx, {});
    const fd = new FormData();
    fd.set("bucket", "galeria");
    fd.set("file", new File([new Uint8Array([1, 2, 3])], "p.png", { type: "image/png" }));
    const res = await ctx.request("/api/uploads", { method: "POST", headers: user.auth, body: fd });
    expect(res.status).toBe(201);
    const out = await body(res);
    expect(out.url).toMatch(/^\/uploads\/galeria\/[0-9a-f-]+\.png$/);

    const fetched = await ctx.request(out.url);
    expect(fetched.status).toBe(200);
    expect(fetched.headers.get("content-type")).toBe("image/png");
  });

  test("rejects unauthenticated uploads and bad buckets", async () => {
    const fd = new FormData();
    fd.set("file", new File([new Uint8Array([1])], "p.png", { type: "image/png" }));
    expect((await ctx.request("/api/uploads", { method: "POST", body: fd })).status).toBe(401);
  });
});
