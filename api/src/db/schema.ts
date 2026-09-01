import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/**
 * JS property names are kept snake_case on purpose: API responses must stay
 * byte-compatible with the shapes the frontend already consumes from
 * Supabase/PostgREST, so the migration touches transport only, not every JSX.
 */

/** Matches the legacy Supabase `public.app_role` enum. */
export const appRole = pgEnum("app_role", ["admin", "moderator", "user"]);

const created_at = timestamp("created_at", { withTimezone: true, mode: "string" })
  .notNull()
  .defaultNow();

const updated_at = timestamp("updated_at", { withTimezone: true, mode: "string" })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date().toISOString());

/**
 * Replaces Supabase `auth.users` + `public.profiles`. The UUID stays compatible
 * with the old `auth.users.id` so `created_by`, roles, etc. map over unchanged.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  // From legacy profiles.approved — gates access to `tipo = 'jovens'` cultos.
  approved: boolean("approved").notNull().default(false),
  created_at,
  updated_at,
});

export const user_roles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: appRole("role").notNull(),
  },
  (t) => ({
    userRoleUnique: uniqueIndex("user_roles_user_id_role_key").on(t.user_id, t.role),
  }),
);

export const refresh_tokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token_hash: text("token_hash").notNull(),
    expires_at: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    created_at,
  },
  (t) => ({
    tokenHashIdx: uniqueIndex("refresh_tokens_token_hash_key").on(t.token_hash),
  }),
);

export const temas = pgTable(
  "temas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    descricao: text("descricao"),
    ordem: integer("ordem").default(0),
    publicado: boolean("publicado").notNull().default(true),
    parent_id: uuid("parent_id").references((): AnyPgColumn => temas.id, {
      onDelete: "set null",
    }),
    created_at,
    updated_at,
  },
  (t) => ({
    parentIdx: index("idx_temas_parent_id").on(t.parent_id),
  }),
);

export const tags_gerais = pgTable("tags_gerais", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull().unique(),
  created_at,
});

export const tags_jovens = pgTable("tags_jovens", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull().unique(),
  created_at,
});

export const cultos = pgTable("cultos", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  data: date("data", { mode: "string" }).notNull(),
  pregador: text("pregador"),
  video_url: text("video_url"),
  thumbnail_url: text("thumbnail_url"),
  descricao: text("descricao"),
  resumo: text("resumo"),
  status: text("status").notNull().default("rascunho"),
  tipo: text("tipo").notNull().default("geral"),
  tema_id: uuid("tema_id").references(() => temas.id, { onDelete: "set null" }),
  tag_jovem_id: uuid("tag_jovem_id").references(() => tags_jovens.id, { onDelete: "set null" }),
  tag_geral_id: uuid("tag_geral_id").references(() => tags_gerais.id, { onDelete: "set null" }),
  created_by: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  created_at,
  updated_at,
});

export const doutrinas = pgTable("doutrinas", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  autor: text("autor").notNull(),
  data: date("data", { mode: "string" }).notNull(),
  resumo: text("resumo"),
  conteudo: text("conteudo"),
  publicado: boolean("publicado").notNull().default(true),
  created_by: uuid("created_by"),
  created_at,
  updated_at,
});

export const estudos = pgTable("estudos", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  autor: text("autor").notNull(),
  data: date("data", { mode: "string" }).notNull(),
  resumo: text("resumo"),
  conteudo: text("conteudo"),
  publicado: boolean("publicado").notNull().default(true),
  tema_id: uuid("tema_id").references(() => temas.id, { onDelete: "set null" }),
  created_by: uuid("created_by"),
  created_at,
  updated_at,
});

export const paginas = pgTable("paginas", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  titulo: text("titulo").notNull(),
  conteudo: text("conteudo"),
  created_at,
  updated_at,
});

export const site_config = pgTable("site_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull().default(sql`'{}'::jsonb`),
  updated_at,
});

export const galeria_fotos = pgTable("galeria_fotos", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  categoria: text("categoria").notNull().default("geral"),
  descricao: text("descricao"),
  ordem: integer("ordem"),
  created_at,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AppRole = (typeof appRole.enumValues)[number];
