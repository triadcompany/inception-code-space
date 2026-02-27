
-- Create pages table for CMS-editable pages
CREATE TABLE public.paginas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  conteudo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.paginas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pages"
ON public.paginas FOR SELECT
USING (true);

CREATE POLICY "Admins can insert pages"
ON public.paginas FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pages"
ON public.paginas FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pages"
ON public.paginas FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_paginas_updated_at
BEFORE UPDATE ON public.paginas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing pages
INSERT INTO public.paginas (slug, titulo, conteudo) VALUES
  ('sobre', 'Sobre', NULL),
  ('20-anos', '20 Anos de Ministério', NULL),
  ('o-inicio', 'O Início', NULL),
  ('cultos-especiais', 'Cultos Especiais', NULL);
