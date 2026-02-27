
-- Create doutrinas table (similar structure to estudos)
CREATE TABLE public.doutrinas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  data DATE NOT NULL,
  resumo TEXT,
  conteudo TEXT,
  publicado BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doutrinas ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public can view published doutrinas" ON public.doutrinas
  FOR SELECT USING (publicado = true);

CREATE POLICY "Authenticated can view published doutrinas" ON public.doutrinas
  FOR SELECT TO authenticated USING (publicado = true);

CREATE POLICY "Admins can manage doutrinas" ON public.doutrinas
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_doutrinas_updated_at
  BEFORE UPDATE ON public.doutrinas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
