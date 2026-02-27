
-- Create temas table
CREATE TABLE public.temas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  publicado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.temas ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public can view published temas" ON public.temas FOR SELECT USING (publicado = true);
CREATE POLICY "Authenticated can view published temas" ON public.temas FOR SELECT TO authenticated USING (publicado = true);
CREATE POLICY "Admins can manage temas" ON public.temas FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add tema_id to estudos
ALTER TABLE public.estudos ADD COLUMN tema_id UUID REFERENCES public.temas(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_temas_updated_at BEFORE UPDATE ON public.temas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
