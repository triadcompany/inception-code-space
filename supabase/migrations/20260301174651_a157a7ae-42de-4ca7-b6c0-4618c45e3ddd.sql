
-- Add tipo column to cultos (default 'geral')
ALTER TABLE public.cultos ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'geral';

-- Drop existing public/authenticated SELECT policies to recreate with tipo logic
DROP POLICY IF EXISTS "Public can view published cultos" ON public.cultos;
DROP POLICY IF EXISTS "Authenticated can view published cultos" ON public.cultos;

-- Public (anonymous) can only see published cultos that are NOT 'jovens'
CREATE POLICY "Public can view published cultos"
ON public.cultos FOR SELECT
USING (status = 'publicado' AND tipo = 'geral');

-- Authenticated users can see published 'geral' cultos always,
-- and 'jovens' cultos only if they are approved members
CREATE POLICY "Authenticated can view published cultos"
ON public.cultos FOR SELECT TO authenticated
USING (
  status = 'publicado' AND (
    tipo = 'geral'
    OR (
      tipo = 'jovens'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.approved = true
      )
    )
  )
);
