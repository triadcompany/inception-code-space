
-- Create estudos table
CREATE TABLE public.estudos (
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
ALTER TABLE public.estudos ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage estudos"
ON public.estudos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can view published
CREATE POLICY "Public can view published estudos"
ON public.estudos FOR SELECT
TO anon
USING (publicado = true);

-- Authenticated can view published
CREATE POLICY "Authenticated can view published estudos"
ON public.estudos FOR SELECT
TO authenticated
USING (publicado = true);

-- Trigger for updated_at
CREATE TRIGGER update_estudos_updated_at
BEFORE UPDATE ON public.estudos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
