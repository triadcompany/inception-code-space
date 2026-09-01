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

/** Matches the legacy Supabase `public.app_role` enum. */
export const appRole = pgEnum("app_role", ["admin", "moderator", "user"]);

const createdAt = timestamp("created_at", { withTimezone: true, mode: "string" })
  .notNull()
  .defaultNow();

const updatedAt = timestamp("updated_at", { withTimezone: true, mode: "string" })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date().toISOString());

/**
 * Replaces Supabase `auth.users` + `public.profiles`.
 * The UUID is kept compatible with the old `auth.users.id` so existing
 * rows in content tables (`created_by`, roles, etc.) map over unchanged.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  // From legacy profiles.approved — gates access to `tipo = 'jovens'` cultos.
  approved: boolean("approved").notNull().default(false),
  createdAt,
  updatedAt,
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: appRole("role").notNull(),
  },
  (t) => ({
    userRoleUnique: uniqueIndex("user_roles_user_id_role_key").on(t.userId, t.role),
  }),
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    createdAt,
  },
  (t) => ({
    tokenHashIdx: uniqueIndex("refresh_tokens_token_hash_key").on(t.tokenHash),
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
    parentId: uuid("parent_id").references((): AnyPgColumn => temas.id, {
      onDelete: "set null",
    }),
    createdAt,
    updatedAt,
  },
  (t) => ({
    parentIdx: index("idx_temas_parent_id").on(t.parentId),
  }),
);

export const tagsGerais = pgTable("tags_gerais", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull().unique(),
  createdAt,
});

export const tagsJovens = pgTable("tags_jovens", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull().unique(),
  createdAt,
});

export const cultos = pgTable("cultos", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  data: date("data", { mode: "string" }).notNull(),
  pregador: text("pregador"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  descricao: text("descricao"),
  resumo: text("resumo"),
  status: text("status").notNull().default("rascunho"),
  tipo: text("tipo").notNull().default("geral"),
  temaId: uuid("tema_id").references(() => temas.id, { onDelete: "set null" }),
  tagJovemId: uuid("tag_jovem_id").references(() => tagsJovens.id, { onDelete: "set null" }),
  tagGeralId: uuid("tag_geral_id").references(() => tagsGerais.id, { onDelete: "set null" }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt,
  updatedAt,
});

export const doutrinas = pgTable("doutrinas", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  autor: text("autor").notNull(),
  data: date("data", { mode: "string" }).notNull(),
  resumo: text("resumo"),
  conteudo: text("conteudo"),
  publicado: boolean("publicado").notNull().default(true),
  createdBy: uuid("created_by"),
  createdAt,
  updatedAt,
});

export const estudos = pgTable("estudos", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  autor: text("autor").notNull(),
  data: date("data", { mode: "string" }).notNull(),
  resumo: text("resumo"),
  conteudo: text("conteudo"),
  publicado: boolean("publicado").notNull().default(true),
  temaId: uuid("tema_id").references(() => temas.id, { onDelete: "set null" }),
  createdBy: uuid("created_by"),
  createdAt,
  updatedAt,
});

export const paginas = pgTable("paginas", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  titulo: text("titulo").notNull(),
  conteudo: text("conteudo"),
  createdAt,
  updatedAt,
});

export const siteConfig = pgTable("site_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull().default(sql`'{}'::jsonb`),
  updatedAt,
});

export const galeriaFotos = pgTable("galeria_fotos", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  categoria: text("categoria").notNull().default("geral"),
  descricao: text("descricao"),
  ordem: integer("ordem"),
  createdAt,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type AppRole = (typeof appRole.enumValues)[number];
