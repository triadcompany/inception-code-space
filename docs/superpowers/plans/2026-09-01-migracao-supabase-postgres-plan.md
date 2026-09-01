# Plano de implementação — Migração Supabase → Postgres na VPS

**Spec:** `docs/superpowers/specs/2026-09-01-migracao-supabase-postgres-design.md`
**Branch:** `migracao-supabase-postgres`

Estrutura do repo após a migração:

```
/                     # frontend Vite (como hoje)
  api/                # nova API Node (Hono + Drizzle)
  docker-compose.yml  # postgres + api + web para dev/paridade
  scripts/migrate-data/  # scripts de migração de dados
```

Cada fase termina com verificação. Não avançar de fase sem ela passar.

---

## Fase 0 — Preparação e exportação

**Entradas necessárias do usuário:**
- Connection string do Postgres do Supabase (Dashboard → Settings → Database →
  Connection string, modo `session`).
- `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_URL` (Settings → API).
- `YOUTUBE_API_KEY` já usada nas edge functions.

**Passos:**
1. `scripts/migrate-data/export.sh`:
   - `pg_dump --schema=public --no-owner --no-privileges` → `dump/public.sql`.
   - `psql -c "\copy (SELECT id, email, encrypted_password, raw_user_meta_data, created_at FROM auth.users) TO 'dump/auth_users.csv' CSV HEADER"`.
2. `scripts/migrate-data/download-storage.ts` (usa `@supabase/supabase-js` com
   service role): lista e baixa todos os objetos dos buckets `galeria` e `avatars`
   para `dump/storage/<bucket>/`.
3. Commitar só os scripts; `dump/` entra no `.gitignore`.

**Verificação:** `dump/public.sql` contém `CREATE TABLE public.cultos`; `auth_users.csv`
tem N linhas > 0; `dump/storage/galeria/` e `dump/storage/avatars/` populados;
contar arquivos e anotar (baseline pra Fase 7).

---

## Fase 1 — Scaffold da API

1. `api/package.json`: `hono`, `@hono/node-server`, `drizzle-orm`, `pg`,
   `drizzle-kit` (dev), `tsx` (dev), `vitest` (dev), `bcryptjs`, `jsonwebtoken`,
   `zod`, `node-cron`, `@types/*`.
2. `api/src/db/schema.ts` — Drizzle, todas as tabelas:
   - `appRole` enum (`admin`, `moderator`, `user`).
   - `users`: `id uuid pk defaultRandom`, `email text unique notNull`,
     `passwordHash text notNull`, `displayName text`, `avatarUrl text`,
     `createdAt`, `updatedAt`.
   - `userRoles`: `id`, `userId → users.id onDelete cascade`, `role appRole`,
     `unique(userId, role)`.
   - `refreshTokens`: `id`, `userId → users.id onDelete cascade`,
     `tokenHash text`, `expiresAt timestamptz`, `createdAt`.
   - `cultos`, `doutrinas`, `estudos`, `temas`, `paginas`, `siteConfig`,
     `tagsGerais`, `tagsJovens`, `galeria`, `galeriaFotos` — colunas idênticas
     aos migrations em `supabase/migrations/` (conferir cada um).
3. `api/drizzle.config.ts` apontando pra `DATABASE_URL`.
4. `pnpm drizzle-kit generate` → `api/drizzle/0000_init.sql`. Adicionar à mão a
   função + triggers `update_updated_at_column` (copiar de
   `supabase/migrations/20260226230005_*.sql`) num `api/drizzle/0001_triggers.sql`.
5. `api/src/db/client.ts` — pool `pg` + `drizzle()`.
6. `api/src/index.ts` — Hono app, `GET /api/health` → `{ ok: true }`, escuta em
   `PORT` (default 8080). CORS liberado só em dev.
7. `api/src/env.ts` — validação zod de `DATABASE_URL`, `JWT_SECRET`,
   `YOUTUBE_API_KEY`, `UPLOAD_DIR`, `INTERNAL_TOKEN`, `PORT`.
8. `api/Dockerfile` — multi-stage, `node:20-alpine`, roda migrations no boot
   (`drizzle-kit migrate`) e sobe `node dist/index.js`.

**Verificação:** `docker compose up postgres api` sobe; `curl localhost:8080/api/health`
→ `{"ok":true}`; `\dt` no Postgres lista todas as tabelas; triggers `update_*_updated_at`
existem.

---

## Fase 2 — Autenticação

1. `api/src/auth/password.ts` — `hash`, `verify` (bcryptjs, cost 10; compatível
   com hashes do GoTrue).
2. `api/src/auth/tokens.ts` — `signAccess(userId, roles)` (JWT HS256, 15 min),
   `verifyAccess`, `issueRefresh(userId)` (grava hash sha256 em `refreshTokens`,
   30 dias), `rotateRefresh`, `revokeRefresh`.
3. `api/src/auth/middleware.ts` — `requireAuth` (lê `Authorization: Bearer`,
   popula `c.var.user`), `requireAdmin` (checa role `admin` em `userRoles`).
4. `api/src/routes/auth.ts`:
   - `POST /api/auth/register` — zod `{ email, password, displayName? }`;
     `bcrypt.hash`; cria `users`; **sem role**; devolve access + set-cookie refresh.
   - `POST /api/auth/login` — valida; devolve access + set-cookie refresh.
   - `POST /api/auth/refresh` — lê cookie; rotaciona; novo access.
   - `POST /api/auth/logout` — revoga refresh; limpa cookie.
   - `GET /api/auth/me` — `requireAuth`; `{ id, email, displayName, avatarUrl, roles }`.
   - `PATCH /api/auth/me` — `requireAuth`; atualiza `displayName`, `avatarUrl`.
5. Testes vitest: registro→login→me; senha errada → 401; refresh rotaciona e
   invalida o anterior; `requireAdmin` barra não-admin.

**Verificação:** suíte de auth verde. Manual: `curl` register + login retorna JWT
decodificável com `sub` e `roles`.

---

## Fase 3 — Rotas de recursos

Uma rota por recurso em `api/src/routes/<recurso>.ts`, montadas em `/api/<recurso>`.
Regra de autorização espelha as policies atuais:

| Recurso | Leitura | Escrita |
|---|---|---|
| `cultos`, `doutrinas`, `estudos`, `temas` | pública só de `publicado`/status publicado; admin vê tudo | `requireAdmin` |
| `paginas` | pública | `requireAdmin` |
| `site_config` | pública | `requireAdmin` |
| `tags_gerais`, `tags_jovens` | pública | `requireAdmin` |
| `galeria`, `galeria_fotos` | pública | `requireAdmin` |
| `usuarios` (lista de `users` + roles) | `requireAdmin` | `requireAdmin` |

Cada rota expõe o que o front usa hoje (conferir call sites):
`GET /` (com query `?order=`, `?status=`, `?parentId=`, `?slug=`), `GET /:id`,
`POST /`, `PATCH /:id`, `DELETE /:id`. Respostas em JSON puro (array ou objeto);
`GET /:id` inexistente → 404 (o front trata como `maybeSingle` null).

Contrato de erro uniforme: `{ error: string }` + status HTTP. Sucesso: corpo = dado.

Testes vitest por recurso: CRUD completo como admin; leitura anônima só traz
publicados; escrita anônima → 401/403.

**Verificação:** suíte verde. `curl` anônimo em `/api/cultos` só devolve publicados;
`curl` admin cria/edita/deleta um culto.

---

## Fase 4 — Uploads

1. `api/src/routes/uploads.ts`:
   - `POST /api/uploads` — `requireAuth`, multipart; valida mime imagem, tamanho
     máx; grava `UPLOAD_DIR/<bucket>/<uuid>.<ext>` (`bucket` do form, whitelist
     `galeria|avatars`); devolve `{ url: "/uploads/<bucket>/<file>" }`.
   - `DELETE /api/uploads?path=<bucket>/<file>` — `requireAdmin`; remove do disco.
2. Dev: `api` serve `GET /uploads/*` estático de `UPLOAD_DIR`. Prod: nginx faz isso
   (Fase 8), a rota estática do Node fica como fallback.

**Verificação:** upload via `curl -F` grava arquivo e a URL retornada abre;
delete some com o arquivo.

---

## Fase 5 — Portar edge functions

1. `DELETE /api/admin/users/:id` (`requireAdmin`) — bloqueia auto-exclusão; deleta
   `users` (cascata leva `userRoles`, `refreshTokens`). Porta `delete-user`.
2. `POST /api/admin/youtube/import` (`requireAdmin`) — porta `youtube-import`
   trocando `supabase.from("cultos")` por Drizzle; `YOUTUBE_API_KEY` do env; mesmo
   corpo de request/response (`channelId`, `pageToken`, `mode`, `years`,
   `nextPageToken`, `hasMore`).
3. `POST /api/internal/youtube/live-check` — header `x-internal-token` ===
   `INTERNAL_TOKEN`. Porta `youtube-live-check` (lê/grava `site_config`
   `key='site'` e `key='current_live'`; arquiva culto quando a live encerra).
4. `api/src/cron.ts` — `node-cron` a cada 2 min chama a rota interna
   in-process (ou `fetch` local com o token). Ativa só se `ENABLE_CRON=true`.

**Verificação:** `import` com um `channelId` real traz cultos; segundo run pula os
já existentes. `live-check` manual retorna `{ live: false }` sem erro. Cron loga
execução a cada 2 min.

---

## Fase 6 — Camada de dados do frontend

1. `src/lib/api.ts` — `apiFetch(path, opts)`:
   - base `import.meta.env.VITE_API_URL ?? "/api"`.
   - injeta `Authorization: Bearer <accessToken>` (do módulo de sessão).
   - no `401`: tenta `POST /auth/refresh` uma vez, repete a request; se falhar,
     limpa sessão e dispara logout.
   - retorna sempre `{ data, error }` (nunca lança) — imita supabase-js.
   - helpers `get/post/patch/del`.
2. `src/lib/session.ts` — access token em memória + espelho em `localStorage`
   (`auth_token`); `getToken`, `setSession`, `clearSession`, pub/sub pro contexto.
3. `src/lib/resources.ts` — funções tipadas usando tipos de
   `api/src/db/schema.ts` (exportar via `import type`), ex.:
   `listCultos(params?)`, `getCulto(id)`, `createCulto(body)`, `updateCulto(id, body)`,
   `deleteCulto(id)`; idem `doutrinas`, `estudos`, `temas`, `paginas`, `siteConfig`,
   `galeria`, `galeriaFotos`, `tags*`, `usuarios`. `uploadFile(bucket, file)`,
   `deleteFile(path)`.
4. Reescrever:
   - `src/hooks/useAuth.tsx` — estado local (`user`, `isAdmin`, `loading`),
     `signIn`, `signOut`; no mount chama `GET /auth/me`; sem `onAuthStateChange`.
     Mantém o cache de admin (já vem no `/me`).
   - `src/hooks/useSiteConfig.ts` — `getSiteConfig()`.
   - `src/pages/Login.tsx`, `Registro.tsx`, `AdminLogin.tsx` — `signIn`/`register`.
   - `src/pages/Perfil.tsx` — `PATCH /auth/me` + `uploadFile("avatars", ...)`.
5. Trocar os call sites nos 28 arquivos restantes (lista abaixo). Padrão:
   `supabase.from("x")...` → `listX()/getX()/...`; `supabase.storage.from(b)` →
   `uploadFile/deleteFile`; `supabase.functions.invoke("delete-user"|"youtube-import"|"youtube-live-check")`
   → `api.post("/admin/users/..."|"/admin/youtube/import"|"/internal/...")`.
   - `Fotos.tsx`: remover a reescrita de URL `/render/image/`; usar `url` direto.
   - `AoVivo.tsx`: `api.post("/internal/youtube/live-check")` — ou melhor, expor
     `GET /api/youtube/live` público que só lê o `site_config current_live`
     (evita expor o token no front). **Decisão:** criar `GET /api/youtube/live`
     público de leitura; o cron continua fazendo o check pesado.
6. `rm -rf src/integrations/supabase`. Remover `@supabase/supabase-js` do
   `package.json`. Ajustar `.env` (tirar `VITE_SUPABASE_*`).
7. `tsc --noEmit` + `pnpm build` limpos. Rodar a suíte vitest do front
   (`vitest.config.ts` já existe) e ajustar mocks.

**Arquivos com call sites a trocar (Fase 6.5):**
`src/components/FeaturedSermon.tsx`, `src/components/Navbar.tsx`,
`src/components/admin/{ConfiguracoesContent,CultosContent,DoutrinasContent,EditCultoModal,EditDoutrinaModal,EditEstudoModal,EstudosContent,GaleriaContent,NovaDoutrinaModal,NovoCultoModal,NovoEstudoModal,PaginasContent,RichTextEditor,TagCultoSelector,TemasContent,UsuariosContent}.tsx`,
`src/pages/{AoVivo,CultoDetalhe,Cultos,CultosEspeciais,Doutrina,DoutrinaDetalhe,EstudoDetalhe,EstudosBiblicos,Fotos}.tsx`.

**Verificação:** `grep -r supabase src` → zero ocorrências. `pnpm build` ok.
App em dev (`vite` + `api` + `postgres` com dados de teta) navega todas as rotas;
login admin abre o painel; criar/editar/deletar um culto funciona; upload de foto
na galeria funciona; página "Ao Vivo" carrega.

---

## Fase 7 — Script de migração de dados

`scripts/migrate-data/load.ts` (roda contra o Postgres novo, já com schema):

1. `psql < dump/public.sql` num schema temporário `legacy` (ou banco separado)
   pra ter as tabelas de origem, incluindo `profiles`.
2. Inserir `users`: para cada linha de `auth_users.csv` →
   `INSERT INTO users (id, email, password_hash, display_name, avatar_url, created_at)`
   com `display_name`/`avatar_url` vindos de `legacy.profiles` por `user_id`
   (fallback: `raw_user_meta_data->>'display_name'`, senão `email`).
3. Copiar `legacy.user_roles` → `user_roles` (mesmos UUIDs; FK agora → `users`).
4. Copiar as tabelas de conteúdo `legacy.*` → tabelas novas (colunas iguais):
   `cultos`, `doutrinas`, `estudos`, `temas`, `paginas`, `site_config`,
   `tags_gerais`, `tags_jovens`, `galeria`, `galeria_fotos`.
5. Copiar `dump/storage/<bucket>/*` → `UPLOAD_DIR/<bucket>/` (preservar nomes).
6. Reescrever URLs (SQL):
   `UPDATE galeria_fotos SET url = replace(url, 'https://<proj>.supabase.co/storage/v1/object/public/', '/uploads/')`;
   idem `users.avatar_url`; varrer `site_config.value` (JSON) por strings de
   storage e trocar.
7. `DROP SCHEMA legacy CASCADE`.

Rodar em transação; abortar tudo se qualquer contagem divergir.

**Verificação:** `SELECT count(*)` por tabela === contagem do Supabase (Fase 0
baseline). `count(*) from users` === linhas do CSV. Nº de arquivos em
`UPLOAD_DIR/galeria` + `avatars` === baixados na Fase 0. Nenhuma URL restante
contém `supabase.co`. Abrir 3 fotos aleatórias da `galeria_fotos.url` → 200.

---

## Fase 8 — Docker / EasyPanel

1. `docker-compose.yml` na raiz (dev e referência de paridade):
   - `postgres:16` + volume `pgdata`.
   - `api` (build `./api`) — env do `.env`; volume `uploads:/data/uploads`
     (`UPLOAD_DIR=/data/uploads`); `ENABLE_CRON=true`.
   - `web` (build `.` com o `Dockerfile` atual) — volume `uploads` montado
     read-only em `/usr/share/nginx/html/uploads`.
2. Ajustar `nginx.conf` do `web`:
   - `location /api/ { proxy_pass http://api:8080; }` (headers padrão + upgrade).
   - `location /uploads/ { alias /usr/share/nginx/html/uploads/; expires 1y; add_header Cache-Control "public, immutable"; }`
   - `client_max_body_size` alinhado ao limite de upload.
   - SPA fallback `try_files $uri /index.html` continua.
3. EasyPanel: 3 serviços espelhando o compose. Postgres com volume; `api` com
   volume `uploads` e as envs; `web` com o mesmo volume `uploads` (RO) e
   `VITE_API_URL` vazio (same-origin `/api`). Domínio → `web`.
4. `docs/DEPLOY.md` — runbook: ordem de subida, envs, como rodar a migração
   (Fase 7) via container efêmero `api` com o `dump/` montado.

**Verificação:** `docker compose up` local sobe os 3; site abre em `localhost`,
`/api/health` responde via nginx, `/uploads/<arquivo-de-teste>` abre. Build do
`web` não contém `@supabase`.

---

## Fase 9 — Cutover

1. Congelar escrita no site antigo (avisar admins).
2. Re-exportar (Fase 0) pra pegar dados frescos.
3. Provisionar Postgres na VPS; rodar migrations (`api` boot) e Fase 7.
4. Subir `api` e `web` no EasyPanel com as envs de produção.
5. Smoke test em produção (checklist abaixo).
6. Apontar o domínio pro novo `web`. Manter o Supabase de pé por ~7 dias como
   rollback (é só reverter DNS/env).
7. Depois da janela: remover `supabase/` do repo, revogar chaves, apagar o
   projeto Supabase.

**Checklist de smoke test (Fases 6 e 9):**
- [ ] Home, Cultos, Culto detalhe, Doutrina, Estudos, Fotos, Sobre, Contato, Ao Vivo carregam.
- [ ] Login de usuário comum com senha antiga funciona.
- [ ] Login de admin abre `/admin`.
- [ ] Criar, editar, publicar/despublicar e deletar um culto.
- [ ] Upload e exclusão de foto na galeria.
- [ ] Editar perfil + trocar avatar.
- [ ] `youtube-import` importa; `live-check` (cron) roda sem erro.
- [ ] Deletar um usuário de teste pelo painel.
- [ ] `grep -r supabase src` vazio; bundle sem `@supabase/supabase-js`.

---

## Ordem de execução e checkpoints

Fases 1→5 (API) podem ser feitas inteiras antes de tocar no front. Fase 6 depende
de 2–5. Fase 7 depende de 1 (schema) e 0 (dump). Fase 8 depende de 6. Fase 9 por
último. Commit por fase; PR único na branch `migracao-supabase-postgres`.
