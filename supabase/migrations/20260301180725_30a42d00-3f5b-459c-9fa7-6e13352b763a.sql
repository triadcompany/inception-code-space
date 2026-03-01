
-- Create tags table for youth services
CREATE TABLE public.tags_jovens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tags_jovens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags" ON public.tags_jovens FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.tags_jovens FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add tag reference to cultos
ALTER TABLE public.cultos ADD COLUMN tag_jovem_id UUID REFERENCES public.tags_jovens(id) ON DELETE SET NULL;
