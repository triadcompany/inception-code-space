-- Add tema_id column to cultos table
ALTER TABLE public.cultos ADD COLUMN tema_id uuid REFERENCES public.temas(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_cultos_tema_id ON public.cultos(tema_id);