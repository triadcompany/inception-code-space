import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

/** Uniform error body: { error: string }. Throw this from routes. */
export function httpError(status: number, message: string): HTTPException {
  return new HTTPException(status as never, {
    res: new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  });
}

export const badRequest = (m = "Requisição inválida") => httpError(400, m);
export const unauthorized = (m = "Não autorizado") => httpError(401, m);
export const forbidden = (m = "Acesso negado") => httpError(403, m);
export const notFound = (m = "Não encontrado") => httpError(404, m);
export const conflict = (m = "Conflito") => httpError(409, m);

/** Standard JSON success helper so call sites stay short. */
export function ok<T>(c: Context, data: T, status = 200) {
  return c.json(data as never, status as never);
}
