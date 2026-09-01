# inception-api

API Node (Hono + Drizzle) que substitui o Supabase — banco, auth e storage —
para o site da igreja. Ver o desenho em
`../docs/superpowers/specs/2026-09-01-migracao-supabase-postgres-design.md`.

## Rodando local

```bash
cp .env.example .env      # ajuste DATABASE_URL e JWT_SECRET
npm install
npm run db:migrate        # aplica ./drizzle/* no Postgres
npm run dev               # http://localhost:8080
```

## Scripts

| Script | O quê |
|---|---|
| `npm run dev` | servidor com reload (tsx watch) |
| `npm run start` | servidor (tsx) — usado no container |
| `npm run typecheck` | `tsc` sem emitir |
| `npm test` | vitest — usa PGlite em memória, não precisa de Postgres |
| `npm run db:generate` | gera nova migration a partir de `src/db/schema.ts` |
| `npm run db:migrate` | aplica migrations pendentes |

## Estrutura

```
src/
  env.ts            validação das variáveis de ambiente (zod)
  app.ts            monta o Hono app (injeta o DB, CORS, error handler)
  index.ts          bootstrap do servidor
  db/
    schema.ts       schema Drizzle (espelha o public.* do Supabase + users/refresh_tokens)
    client.ts       pool pg + drizzle
    migrate.ts      runner de migrations (boot do container)
  auth/
    password.ts     bcrypt (compatível com os hashes do GoTrue)
    tokens.ts       JWT de acesso (15 min) + refresh rotativo (30 dias)
    middleware.ts   requireAuth / requireAdmin / optionalAuth / requireInternalToken
  routes/
    auth.ts         /api/auth/{register,login,refresh,logout,me}
drizzle/            migrations SQL geradas + triggers updated_at
test/               suíte vitest (PGlite)
```

## Endpoints (Fase 2)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/health` | — | healthcheck |
| POST | `/api/auth/register` | — | cria usuário (sem role), devolve `accessToken` + `user`, seta cookie `refresh_token` |
| POST | `/api/auth/login` | — | valida senha, mesmo retorno do register |
| POST | `/api/auth/refresh` | cookie | rotaciona o refresh token, novo `accessToken` |
| POST | `/api/auth/logout` | cookie | revoga o refresh token |
| GET | `/api/auth/me` | Bearer | usuário atual + roles |
| PATCH | `/api/auth/me` | Bearer | atualiza `displayName` / `avatarUrl` |

Rotas de conteúdo (`cultos`, `doutrinas`, …), uploads e as edge functions
portadas entram nas Fases 3–5.

## Dev cross-origin

O cookie `refresh_token` é `SameSite=Lax` e escopado em `/api/auth`. Em produção
o nginx serve front e API na mesma origem. Em dev, configure o proxy do Vite
(`server.proxy` para `/api` → `http://localhost:8080`) para o navegador enxergar
tudo como mesma origem — isso entra na Fase 6.
