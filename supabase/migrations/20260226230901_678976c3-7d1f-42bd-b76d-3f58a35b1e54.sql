
CREATE TABLE public.cultos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  pregador TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  descricao TEXT,
  resumo TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cultos ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage cultos" ON public.cultos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can view published cultos
CREATE POLICY "Public can view published cultos" ON public.cultos
  FOR SELECT TO anon
  USING (status = 'publicado');

-- Authenticated users can view published cultos
CREATE POLICY "Authenticated can view published cultos" ON public.cultos
  FOR SELECT TO authenticated
  USING (status = 'publicado');

CREATE TRIGGER update_cultos_updated_at
  BEFORE UPDATE ON public.cultos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
