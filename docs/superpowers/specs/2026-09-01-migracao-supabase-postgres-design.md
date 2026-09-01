# Migração Supabase → Postgres na VPS

**Data:** 2026-09-01
**Status:** Aprovado, aguardando plano de implementação

## Objetivo

Remover a dependência do Supabase hospedado e passar a rodar tudo na VPS do usuário
via EasyPanel + Docker, usando Postgres puro. O site (frontend) não muda de
comportamento nem de aparência — muda apenas a camada que fornece banco, auth e
storage.

## Contexto atual

O projeto é um SPA Vite + React + TypeScript + shadcn/ui + Tailwind que fala
**direto** com o Supabase, sem backend próprio. Superfície usada hoje:

| Recurso | Onde |
|---|---|
| **Auth** email/senha (GoTrue) | `useAuth.tsx`, `Login`, `Registro`, `AdminLogin`, `Perfil`. Métodos: `signUp`, `signInWithPassword`, `signOut`, `onAuthStateChange`, `getSession`, `getUser`, `updateUser` |
| **Banco via PostgREST** | ~23 chamadas `supabase.from()` em ~15 componentes admin. Tabelas: `cultos`, `doutrinas`, `estudos`, `temas`, `paginas`, `profiles`, `site_config`, `user_roles`, `tags_gerais`, `tags_jovens`, `galeria`, `galeria_fotos` |
| **RLS** | Políticas `has_role(auth.uid(), 'admin')` em todas as tabelas; função `has_role` security-definer; trigger `on_auth_user_created` cria `profiles` |
| **Storage** | Buckets `galeria` e `avatars`. `upload`, `remove`, `getPublicUrl`, transform `/render/image/public/` em `Fotos.tsx` |
| **Edge Functions (Deno)** | `delete-user`, `youtube-import`, `youtube-live-check` (esse roda em cron) |

## Decisões

- **Backend:** API Node standalone com **Hono** + **Drizzle ORM** + `pg`. Container
  próprio no EasyPanel. Frontend continua SPA estático (mantém `Dockerfile` e
  `nginx.conf` atuais). Descartado: Nitro só-como-API (peso sem ganho), migração
  pra TanStack Start (reescrita fora de escopo).
- **Auth:** JWT própria na API. Bcrypt para senhas. Os hashes bcrypt do GoTrue
  (`auth.users.encrypted_password`) são copiados para `users.password_hash`, então
  ninguém precisa resetar senha.
- **Storage:** disco da VPS em volume Docker, servido pelo nginx em `/uploads/`.
  Sem transform on-the-fly (o cliente já comprime com `browser-image-compression`).
  Descartado: MinIO e R2 (peça extra / dependência externa; usuário não quer gastar).
- **Deploy:** EasyPanel + Docker, mesmo padrão do projeto "Gestor de Tráfego".
- **RLS:** eliminada. Autorização passa para middleware da API (`requireAuth`,
  `requireAdmin`).

## Arquitetura

Três containers no EasyPanel:

```
┌─────────────┐     /api/*  ┌──────────────┐      ┌────────────┐
│  web        │────proxy───▶│  api         │─────▶│ postgres   │
│  nginx +    │             │  Hono + node │      │  + volume  │
│  build Vite │  /uploads/* │  + Drizzle   │      └────────────┘
│             │──▶ volume ──┤  JWT auth    │
└─────────────┘   (estático)│  node-cron   │
                            └──────┬───────┘
                                   └── volume uploads/ (compartilhado com web)
```

- **postgres:** Postgres 16, volume para dados.
- **api:** Hono. Env: `DATABASE_URL`, `JWT_SECRET`, `YOUTUBE_API_KEY`, `UPLOAD_DIR`,
  `INTERNAL_TOKEN`. Monta o volume `uploads/`. Roda `node-cron` para o
  `youtube-live-check`.
- **web:** build atual. nginx serve o SPA, faz proxy de `/api/*` para a api e serve
  `/uploads/*` direto do volume com `expires 1y`.

## 1. Banco e schema (Drizzle)

Tabelas `public.*` sem RLS. Schema Drizzle reproduz o que já existe:

- **`users`** (substitui `auth.users` + `profiles`): `id uuid pk default gen_random_uuid()`,
  `email text unique not null`, `password_hash text not null`, `display_name text`,
  `avatar_url text`, `created_at timestamptz`, `updated_at timestamptz`.
- **`user_roles`:** `id uuid pk`, `user_id uuid fk users(id) on delete cascade`,
  `role` enum `app_role` (`admin|moderator|user`), `unique(user_id, role)`.
  `hasRole()` vira função TS na API.
- **`refresh_tokens`:** `id uuid pk`, `user_id uuid fk`, `token_hash text`,
  `expires_at timestamptz`, `created_at timestamptz`.
- **Conteúdo, mesma forma dos migrations atuais:** `cultos`, `doutrinas`, `estudos`,
  `temas`, `paginas`, `site_config`, `tags_gerais`, `tags_jovens`, `galeria`,
  `galeria_fotos`.
- `updated_at`: trigger no banco (função `update_updated_at_column`), igual ao dump.
- Migrations geradas por `drizzle-kit`. A primeira é o schema completo; a carga
  inicial vem do `pg_dump` (seção 6).

## 2. Auth (JWT própria)

Endpoints (`/api/auth/*`):

- `POST /register` → cria `users` com `bcrypt.hash`, **sem role** (admin é
  concedido manualmente em `user_roles`, como faz a migration seed atual).
- `POST /login` → valida com `bcrypt.compare`; devolve **access token JWT** (15 min)
  no corpo + **refresh token** (cookie httpOnly, 30 dias) gravado hasheado em
  `refresh_tokens`.
- `POST /refresh` → rotaciona o refresh token, novo access token.
- `POST /logout` → invalida o refresh token.
- `GET /me` → dados do usuário + roles.
- `PATCH /me` → `display_name`, `avatar_url` (cobre o `updateUser` atual).

Migração de senha: `auth.users.encrypted_password` (bcrypt) → `users.password_hash`.
`bcrypt.compare` funciona sem alteração; ninguém reseta senha.

Frontend: `useAuth` guarda o access token em memória + `localStorage` (como hoje),
renova via `/refresh` no primeiro 401. Middlewares `requireAuth` e `requireAdmin`
na API. `onAuthStateChange` vira estado local do contexto React (sem listener
externo).

Efeito da virada: quem estava logado no Supabase precisa logar de novo uma vez.

## 3. Storage

- `POST /api/uploads` (multipart, `requireAuth`) → salva em
  `UPLOAD_DIR/<bucket>/<uuid>.<ext>`, devolve `{ url: "/uploads/<bucket>/<file>" }`.
- `DELETE /api/uploads?path=<bucket>/<file>` (`requireAdmin`).
- Buckets viram subpastas: `galeria/`, `avatars/`.
- nginx serve `/uploads/` do volume com `expires 1y`.
- `Fotos.tsx`: remover a troca `/storage/v1/object/public/` → `/render/image/`;
  servir o original.
- Follow-up opcional (fora do escopo inicial): `sharp` gerando `-thumb` no upload.

## 4. Edge Functions → rotas / cron

| Antes (Deno) | Depois |
|---|---|
| `delete-user` | `DELETE /api/admin/users/:id` (`requireAdmin`, bloqueia auto-exclusão, cascata via FK) |
| `youtube-import` | `POST /api/admin/youtube/import` (`requireAdmin`, mesma lógica, `YOUTUBE_API_KEY` do env) |
| `youtube-live-check` | `POST /api/internal/youtube/live-check` (protegido por `INTERNAL_TOKEN`) + `node-cron` na api a cada ~2 min |

A lógica de negócio é portada quase 1:1 — troca `supabase.from()` por Drizzle e
`Deno.env` por `process.env`.

## 5. Mudanças no frontend

Nenhuma mudança visual ou de UX. Só a camada de dados:

- **Novo `src/lib/api.ts`:** wrapper `fetch` com base `/api`, injeta
  `Authorization: Bearer`, faz refresh no 401, **devolve `{ data, error }`** (mesmo
  formato do supabase-js, para minimizar alteração nos call sites).
- **Novo `src/lib/resources.ts`:** funções tipadas por recurso — `listCultos()`,
  `getCulto(id)`, `createCulto()`, `updateCulto()`, `deleteCulto()`, e equivalentes
  para doutrinas, estudos, temas, paginas, siteConfig, usuarios, galeria.
- **Remover** `src/integrations/supabase/`. Tipos passam a sair do Drizzle
  (`InferSelectModel`).
- **~20 arquivos** trocam `supabase.from("x").select()...` pelas funções de
  `resources.ts`; `supabase.storage...` por `uploadFile()`;
  `supabase.functions.invoke("x")` por `api.post("/admin/...")`.
- `useAuth.tsx`, `useSiteConfig.ts`, `Login`, `Registro`, `AdminLogin`, `Perfil`
  reescritos contra `/api/auth/*`.
- `package.json`: remover `@supabase/supabase-js`.
- `.env`: remover `VITE_SUPABASE_*`; opcionalmente `VITE_API_URL` (ou same-origin
  `/api`).

Exemplo do padrão de troca:

```ts
// antes
const { data, error } = await supabase.from("cultos").select("*").order("data");
// depois
const { data, error } = await listCultos();
```

## 6. Migração de dados

1. `pg_dump` do Supabase (connection string em Database Settings): schema `public`
   completo com dados + `SELECT id, email, encrypted_password, raw_user_meta_data
   FROM auth.users`.
2. Script de carga: insere `users` a partir do dump de `auth.users` (hash →
   `password_hash`) juntando com `public.profiles` do dump (`display_name`,
   `avatar_url`) pelo `user_id`. A tabela `profiles` é só fonte — não existe no
   schema novo. Restaura as demais tabelas `public.*`; `user_roles.user_id` é
   cópia direta (UUIDs preservados, FK agora aponta para `users`).
3. Arquivos de storage: baixar buckets `galeria` e `avatars` (Supabase CLI
   `storage` ou script pela API) para `UPLOAD_DIR/`. `UPDATE` em SQL reescrevendo
   URLs `https://<proj>.supabase.co/storage/v1/object/public/<bucket>/...` →
   `/uploads/<bucket>/...` em `galeria_fotos.url`, `users.avatar_url`,
   `site_config`.
4. Rodar uma vez, conferir contagens (linhas por tabela, arquivos), apontar o
   `.env` de produção para a VPS.

## Fora de escopo (YAGNI)

- Realtime (não é usado).
- Transform de imagem on-the-fly.
- Painel/CRUD de storage.
- Multi-tenancy.
- OAuth social.
- Migração do projeto para meta-framework.

## Critérios de sucesso

- Site idêntico visual e funcionalmente; todas as rotas funcionam.
- Login funciona com as senhas existentes, sem reset.
- Todo o conteúdo (cultos, doutrinas, estudos, temas, páginas, fotos, config)
  presente e correto após a migração.
- Imagens carregam de `/uploads/`.
- `youtube-import` e `youtube-live-check` funcionam; o cron arquiva lives.
- `delete-user` funciona para admin.
- Zero referência a `@supabase/supabase-js` no bundle final.
- Tudo sobe via EasyPanel + Docker (3 serviços).
