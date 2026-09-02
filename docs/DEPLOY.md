# Deploy — Postgres na VPS (EasyPanel + Docker)

Três serviços: **postgres**, **api** (Hono + Drizzle), **web** (build Vite + nginx).
O nginx do `web` serve o SPA, faz proxy de `/api/*` para o `api` e serve
`/uploads/*` de um volume compartilhado com o `api`.

```
┌─────────────┐   /api/*   ┌──────────────┐        ┌────────────┐
│  web        │──proxy────▶│  api :8080   │───────▶│ postgres   │
│  nginx+SPA  │  /uploads/*│  Hono+Drizzle│        │  (pgdata)  │
│             │──volume───▶│  node-cron   │        └────────────┘
└─────────────┘  (uploads) └──────┬───────┘
                                  └── volume `uploads` (rw no api, ro no web)
```

## 1. Rodar local (paridade / teste)

```bash
cp deploy.env.example deploy.env      # preencha JWT_SECRET, INTERNAL_TOKEN, YOUTUBE_API_KEY
docker compose --env-file deploy.env up --build
```

- Site: <http://localhost:8080>
- API direta (debug): <http://localhost:8081/api/health>
- As migrations do banco rodam sozinhas no boot do `api`
  (`CMD` = `npm run db:migrate && npm run start`).

Smoke test rápido:

```bash
curl -s localhost:8080/api/health           # {"ok":true}  (via nginx)
# criar o primeiro admin: registre em /registro, depois no banco:
docker compose exec postgres psql -U inception -d inception \
  -c "insert into user_roles (user_id, role) select id, 'admin' from users where email='SEU_EMAIL'; update users set approved=true where email='SEU_EMAIL';"
```

## 2. EasyPanel

Crie um projeto com três serviços espelhando o `docker-compose.yml`:

### postgres
- Imagem: `postgres:16-alpine` (ou o template Postgres do EasyPanel)
- Env: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- Volume: `/var/lib/postgresql/data`

### api
- Build a partir de `./api` (Dockerfile próprio)
- Env:
  | var | valor |
  |---|---|
  | `DATABASE_URL` | `postgres://<user>:<pass>@<host-do-postgres>:5432/<db>` |
  | `JWT_SECRET` | string longa aleatória (`openssl rand -hex 32`) |
  | `INTERNAL_TOKEN` | outra string aleatória |
  | `YOUTUBE_API_KEY` | a mesma chave das edge functions antigas |
  | `UPLOAD_DIR` | `/data/uploads` |
  | `PORT` | `8080` |
  | `NODE_ENV` | `production` |
  | `ENABLE_CRON` | `true` |
- Volume: `uploads` montado em `/data/uploads` (leitura/escrita)
- **Sem domínio público** — só a rede interna precisa alcançar.

### web
- Build a partir da raiz do repo (`Dockerfile`)
- Volume: o **mesmo** `uploads` montado em `/usr/share/nginx/html/uploads` (somente leitura)
- Domínio: aponte o domínio final para este serviço (porta 80)
- `VITE_API_URL` **não** é necessária (o front usa `/api` na mesma origem)

> **Hostname do proxy:** o `nginx.conf` faz `proxy_pass http://api:8080`. Se na
> rede do EasyPanel o serviço não resolver como `api`, ajuste essa linha para o
> hostname interno correto (ex.: `<projeto>_api`) e rebuild o `web`.

## 3. Migração de dados (Fase 7)

Ainda não implementada. Quando estiver:

1. `pg_dump` do Postgres do Supabase + `\copy` de `auth.users`
   (`scripts/migrate-data/export.sh`).
2. Baixar os buckets `galeria` e `avatars` (`scripts/migrate-data/download-storage.ts`).
3. Rodar `scripts/migrate-data/load.ts` contra o Postgres novo (schema já
   aplicado pelo boot do `api`), que também copia os arquivos para o volume
   `uploads` e reescreve as URLs `*.supabase.co/storage/...` → `/uploads/...`.

Rodar via container efêmero com o dump montado:

```bash
docker compose run --rm -v "$PWD/dump:/app/dump" api npx tsx scripts/migrate-data/load.ts
```

## 4. Migrations do schema (manual, se preciso)

```bash
docker compose exec api npm run db:migrate      # aplica ./drizzle/*
docker compose exec api npm run db:generate     # gera nova migration a partir de src/db/schema.ts
```

## 5. Cutover

Ver o checklist da Fase 9 em
`docs/superpowers/plans/2026-09-01-migracao-supabase-postgres-plan.md`.
Resumo: congelar escrita no site antigo → re-exportar → subir stack nova →
rodar migração → smoke test → apontar DNS → manter Supabase ~7 dias como rollback.
