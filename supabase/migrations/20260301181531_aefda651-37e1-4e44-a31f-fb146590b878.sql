
CREATE TABLE public.tags_gerais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tags_gerais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags gerais" ON public.tags_gerais FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags gerais" ON public.tags_gerais FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.cultos ADD COLUMN tag_geral_id UUID REFERENCES public.tags_gerais(id) ON DELETE SET NULL;
