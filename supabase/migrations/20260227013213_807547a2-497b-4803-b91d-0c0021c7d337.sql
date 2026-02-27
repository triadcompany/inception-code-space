
CREATE TABLE public.site_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site config" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Admins can insert site config" ON public.site_config FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update site config" ON public.site_config FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete site config" ON public.site_config FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default rows
INSERT INTO public.site_config (key, value) VALUES
  ('site', '{
    "nome": "Tabernáculo",
    "subtitulo": "O Filho do Homem",
    "descricao": "",
    "hero_imagem": "",
    "hero_boas_vindas": "Bem-vindo ao",
    "hero_titulo": "Tabernáculo",
    "hero_subtitulo": "O Filho do Homem",
    "hero_versiculo": "",
    "hero_referencia": "",
    "contato_endereco1": "",
    "contato_endereco2": "",
    "contato_telefone": "",
    "contato_email": "",
    "social_facebook": "",
    "social_instagram": "",
    "social_youtube": ""
  }'::jsonb),
  ('contato', '{
    "endereco": "",
    "telefones": "",
    "email": "",
    "horarios": "",
    "whatsapp": "",
    "social_facebook": "",
    "social_instagram": "",
    "social_youtube": "",
    "mapa_url": ""
  }'::jsonb),
  ('sobre', '{
    "conteudo": ""
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
