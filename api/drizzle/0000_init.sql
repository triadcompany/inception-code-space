CREATE TYPE "public"."app_role" AS ENUM('admin', 'moderator', 'user');--> statement-breakpoint
CREATE TABLE "cultos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"data" date NOT NULL,
	"pregador" text,
	"video_url" text,
	"thumbnail_url" text,
	"descricao" text,
	"resumo" text,
	"status" text DEFAULT 'rascunho' NOT NULL,
	"tipo" text DEFAULT 'geral' NOT NULL,
	"tema_id" uuid,
	"tag_jovem_id" uuid,
	"tag_geral_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doutrinas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"autor" text NOT NULL,
	"data" date NOT NULL,
	"resumo" text,
	"conteudo" text,
	"publicado" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estudos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"autor" text NOT NULL,
	"data" date NOT NULL,
	"resumo" text,
	"conteudo" text,
	"publicado" boolean DEFAULT true NOT NULL,
	"tema_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "galeria_fotos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"categoria" text DEFAULT 'geral' NOT NULL,
	"descricao" text,
	"ordem" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paginas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"conteudo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paginas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags_gerais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_gerais_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "tags_jovens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_jovens_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "temas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"ordem" integer DEFAULT 0,
	"publicado" boolean DEFAULT true NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "app_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cultos" ADD CONSTRAINT "cultos_tema_id_temas_id_fk" FOREIGN KEY ("tema_id") REFERENCES "public"."temas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultos" ADD CONSTRAINT "cultos_tag_jovem_id_tags_jovens_id_fk" FOREIGN KEY ("tag_jovem_id") REFERENCES "public"."tags_jovens"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultos" ADD CONSTRAINT "cultos_tag_geral_id_tags_gerais_id_fk" FOREIGN KEY ("tag_geral_id") REFERENCES "public"."tags_gerais"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cultos" ADD CONSTRAINT "cultos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estudos" ADD CONSTRAINT "estudos_tema_id_temas_id_fk" FOREIGN KEY ("tema_id") REFERENCES "public"."temas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temas" ADD CONSTRAINT "temas_parent_id_temas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."temas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_temas_parent_id" ON "temas" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles" USING btree ("user_id","role");--> statement-breakpoint
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER update_cultos_updated_at BEFORE UPDATE ON "cultos" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER update_doutrinas_updated_at BEFORE UPDATE ON "doutrinas" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER update_estudos_updated_at BEFORE UPDATE ON "estudos" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER update_temas_updated_at BEFORE UPDATE ON "temas" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER update_paginas_updated_at BEFORE UPDATE ON "paginas" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();--> statement-breakpoint
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON "site_config" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();