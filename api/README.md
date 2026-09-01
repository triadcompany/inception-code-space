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
    cron.ts         node-cron do youtube-live-check (ENABLE_CRON=true)
  auth/
    password.ts     bcrypt (compatível com os hashes do GoTrue)
    tokens.ts       JWT de acesso (15 min) + refresh rotativo (30 dias)
    middleware.ts   requireAuth / requireAdmin / optionalAuth / requireInternalToken
  lib/
    http.ts         helpers de erro/resposta ({ error } uniforme)
    list.ts         parse de ?limit/offset/order/dir/search + isAdmin(c)
  routes/           auth, cultos, conteudo (doutrinas+estudos), temas, paginas,
                    site-config, tags, galeria, usuarios, uploads, youtube
  youtube/
    import.ts       port do youtube-import
    live-check.ts   port do youtube-live-check
drizzle/            migrations SQL geradas + triggers updated_at
test/               suíte vitest (PGlite) — auth, resources, health
```

## Endpoints

Todas as respostas são JSON **snake_case**, byte-compatíveis com o que o front já
consumia do Supabase/PostgREST. Erro: `{ "error": string }` + status HTTP.

### Auth (Fase 2)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/api/health` | — | healthcheck |
| POST | `/api/auth/register` | — | cria usuário (sem role), devolve `accessToken` + `user`, seta cookie `refresh_token` |
| POST | `/api/auth/login` | — | valida senha, mesmo retorno do register |
| POST | `/api/auth/refresh` | cookie | rotaciona o refresh token, novo `accessToken` |
| POST | `/api/auth/logout` | cookie | revoga o refresh token |
| GET | `/api/auth/me` | Bearer | usuário atual + roles |
| PATCH | `/api/auth/me` | Bearer | atualiza `display_name` / `avatar_url` |

### Recursos (Fase 3)

Padrão por recurso: `GET /` (lista), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`.
Leitura pública; escrita exige admin. Recursos com `publicado`/`status`: anônimo só
vê publicados, admin vê tudo.

| Base | Notas |
|---|---|
| `/api/cultos` | filtros `?search=` `?tipo=` `?year=` `?status=` (admin) `?order=data\|created_at\|titulo` `?dir=` `?limit=` `?offset=`. Visibilidade: anônimo → `publicado`+`geral`; membro aprovado → +`jovens`; admin → tudo |
| `/api/doutrinas` | `publicado` gate |
| `/api/estudos` | `publicado` gate + `tema_id` |
| `/api/temas` | ordenado por `ordem` asc; `publicado` gate |
| `/api/paginas` | público; também `GET /api/paginas/slug/:slug` |
| `/api/site-config` | `GET /` (todas), `GET /:key`, `PUT /:key` (admin, upsert `{ value }`) |
| `/api/tags-gerais`, `/api/tags-jovens` | `GET /` público, `POST /` + `DELETE /:id` admin |
| `/api/galeria-fotos` | `?categoria=`; `GET /api/galeria-fotos/counts` → `{ [categoria]: n }` |
| `/api/usuarios` | **admin only**. Lista `users` no formato do antigo `profiles` (`user_id`, `display_name`, `email`, `approved`, `roles`). `PATCH /:id` `{ approved }`; `DELETE /:id` (bloqueia auto-exclusão) |

### Uploads (Fase 4)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/uploads` | Bearer | multipart `file` + `bucket` (`galeria`\|`avatars`), máx 15MB. Retorna `{ path, url }` |
| DELETE | `/api/uploads?path=<bucket>/<arquivo>` | admin | remove do disco |
| GET | `/uploads/*` | — | serve estático (dev/fallback; em prod é o nginx) |

### YouTube (Fase 5 — edge functions portadas)

| Método | Rota | Auth | Origem |
|---|---|---|---|
| POST | `/api/youtube/import` | admin | `youtube-import` — `{ channelId, pageToken?, mode?, years? }` |
| GET | `/api/youtube/live` | — | leitura barata do `site_config.current_live` (sem chamar a API do YouTube) |
| POST | `/api/youtube/live-check` | `x-internal-token` | `youtube-live-check` — também chamado pelo `node-cron` (`ENABLE_CRON=true`, a cada 2 min) |

## Dev cross-origin

O cookie `refresh_token` é `SameSite=Lax` e escopado em `/api/auth`. Em produção
o nginx serve front e API na mesma origem. Em dev, configure o proxy do Vite
(`server.proxy` para `/api` → `http://localhost:8080`) para o navegador enxergar
tudo como mesma origem — isso entra na Fase 6.
