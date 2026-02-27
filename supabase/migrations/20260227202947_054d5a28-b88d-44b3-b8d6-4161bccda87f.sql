ALTER TABLE public.temas ADD COLUMN parent_id uuid REFERENCES public.temas(id) ON DELETE SET NULL;

CREATE INDEX idx_temas_parent_id ON public.temas(parent_id);