import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { userRoles, users } from "../src/db/schema.ts";
import { body, jsonHeaders, readCookie, setupTest, type TestCtx } from "./helpers.ts";

let ctx: TestCtx;
beforeEach(async () => {
  ctx = await setupTest();
});
afterEach(() => ctx.close());

const post = (path: string, payload: unknown, headers: Record<string, string> = {}) =>
  ctx.request(path, {
    method: "POST",
    headers: { ...jsonHeaders, ...headers },
    body: JSON.stringify(payload),
  });

async function register(email = "a@b.com", password = "password123") {
  const res = await post("/api/auth/register", { email, password, displayName: "Alice" });
  return { res, json: await body(res), refresh: readCookie(res, "refresh_token") };
}

describe("register", () => {
  test("creates a user, returns access token + user, sets refresh cookie", async () => {
    const { res, json, refresh } = await register();
    expect(res.status).toBe(201);
    expect(typeof json.accessToken).toBe("string");
    expect(json.user).toMatchObject({ email: "a@b.com", displayName: "Alice", isAdmin: false, roles: [] });
    expect(refresh).toBeTruthy();
  });

  test("rejects duplicate email", async () => {
    await register();
    const res = await post("/api/auth/register", { email: "a@b.com", password: "password123" });
    expect(res.status).toBe(409);
  });

  test("rejects short password", async () => {
    const res = await post("/api/auth/register", { email: "x@y.com", password: "short" });
    expect(res.status).toBe(400);
  });

  test("normalizes email to lowercase", async () => {
    await post("/api/auth/register", { email: "MiXeD@Case.COM", password: "password123" });
    const [row] = await ctx.db.select().from(users);
    expect(row.email).toBe("mixed@case.com");
  });
});

describe("login", () => {
  test("succeeds with correct credentials and includes admin role", async () => {
    const { json } = await register();
    await ctx.db.insert(userRoles).values({ userId: json.user.id, role: "admin" });

    const res = await post("/api/auth/login", { email: "a@b.com", password: "password123" });
    const payload = await body(res);
    expect(res.status).toBe(200);
    expect(payload.user.isAdmin).toBe(true);
    expect(payload.user.roles).toEqual(["admin"]);
    expect(typeof payload.accessToken).toBe("string");
  });

  test("fails with wrong password", async () => {
    await register();
    const res = await post("/api/auth/login", { email: "a@b.com", password: "nope-nope-nope" });
    expect(res.status).toBe(401);
  });

  test("fails for unknown email", async () => {
    const res = await post("/api/auth/login", { email: "ghost@nowhere.com", password: "password123" });
    expect(res.status).toBe(401);
  });
});

describe("me", () => {
  test("returns the current user with a valid access token", async () => {
    const { json } = await register();
    const res = await ctx.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${json.accessToken}` },
    });
    expect(res.status).toBe(200);
    expect((await body(res)).user.email).toBe("a@b.com");
  });

  test("401 without a token", async () => {
    expect((await ctx.request("/api/auth/me")).status).toBe(401);
  });

  test("401 with a garbage token", async () => {
    const res = await ctx.request("/api/auth/me", { headers: { Authorization: "Bearer not.a.jwt" } });
    expect(res.status).toBe(401);
  });

  test("PATCH updates display name", async () => {
    const { json } = await register();
    const res = await ctx.request("/api/auth/me", {
      method: "PATCH",
      headers: { ...jsonHeaders, Authorization: `Bearer ${json.accessToken}` },
      body: JSON.stringify({ displayName: "Alice Cooper" }),
    });
    expect(res.status).toBe(200);
    expect((await body(res)).user.displayName).toBe("Alice Cooper");
  });
});

describe("refresh / logout", () => {
  test("refresh rotates the token and invalidates the previous one", async () => {
    const { refresh } = await register();

    const first = await post("/api/auth/refresh", {}, { Cookie: `refresh_token=${refresh}` });
    expect(first.status).toBe(200);
    const rotated = readCookie(first, "refresh_token");
    expect(rotated).toBeTruthy();
    expect(rotated).not.toBe(refresh);

    const reuse = await post("/api/auth/refresh", {}, { Cookie: `refresh_token=${refresh}` });
    expect(reuse.status).toBe(401);

    const again = await post("/api/auth/refresh", {}, { Cookie: `refresh_token=${rotated}` });
    expect(again.status).toBe(200);
  });

  test("refresh without a cookie is 401", async () => {
    expect((await post("/api/auth/refresh", {})).status).toBe(401);
  });

  test("logout revokes the refresh token", async () => {
    const { refresh } = await register();
    const out = await post("/api/auth/logout", {}, { Cookie: `refresh_token=${refresh}` });
    expect(out.status).toBe(200);
    const after = await post("/api/auth/refresh", {}, { Cookie: `refresh_token=${refresh}` });
    expect(after.status).toBe(401);
  });
});

describe("misc", () => {
  test("a fresh user has no roles", async () => {
    const { json } = await register();
    expect(json.user.roles).not.toContain("admin");
  });

  test("cascade delete removes refresh tokens with the user", async () => {
    const { json, refresh } = await register();
    await ctx.db.delete(users).where(eq(users.id, json.user.id));
    const res = await post("/api/auth/refresh", {}, { Cookie: `refresh_token=${refresh}` });
    expect(res.status).toBe(401);
  });
});
