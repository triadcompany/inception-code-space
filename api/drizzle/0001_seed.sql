-- Seed data for a fresh install (no Supabase migration).
-- Idempotent: safe to run against a DB that already has these rows.

INSERT INTO "site_config" ("key", "value") VALUES
  ('site', '{
    "nome": "Tabernáculo",
    "subtitulo": "O Filho do Homem",
    "descricao": "Uma comunidade de fé dedicada a proclamar a mensagem de Cristo e servir ao próximo com amor.",
    "hero_imagem": "",
    "hero_boas_vindas": "Bem-vindo ao",
    "hero_titulo": "Tabernáculo",
    "hero_subtitulo": "O Filho do Homem",
    "hero_versiculo": "E disse-me: Não seles as palavras da profecia deste livro; porque próximo está o tempo.",
    "hero_referencia": "Apocalipse 22:10",
    "contato_endereco1": "R. Guilherme Bauer, 403, Schroeder/SC.",
    "contato_endereco2": "",
    "contato_telefone": "(47) 98810-3818",
    "contato_email": "contato@tabernaculoofh.com",
    "social_facebook": "",
    "social_instagram": "",
    "social_youtube": "",
    "ao_vivo_url": "",
    "youtube_channel_id": ""
  }'::jsonb),
  ('contato', '{
    "endereco": "R. Guilherme Bauer, 403\nBairro Centro\nSchroeder/SC",
    "telefones": "(47) 98810-3818",
    "email": "contato@tabernaculo.com",
    "horarios": "Sábado: 18h30\nDomingo: 17h30\nQuarta-feira: 19h30",
    "whatsapp": "5547988103818",
    "social_facebook": "",
    "social_instagram": "",
    "social_youtube": "",
    "mapa_url": ""
  }'::jsonb),
  ('sobre', '{ "conteudo": "" }'::jsonb)
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "paginas" ("slug", "titulo", "conteudo") VALUES
  ('sobre', 'Sobre', NULL),
  ('20-anos', '20 Anos de Ministério', NULL),
  ('o-inicio', 'O Início', NULL),
  ('cultos-especiais', 'Cultos Especiais', NULL)
ON CONFLICT ("slug") DO NOTHING;
