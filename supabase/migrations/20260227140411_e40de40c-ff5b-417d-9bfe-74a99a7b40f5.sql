
-- Drop all existing RESTRICTIVE policies on galeria_fotos
DROP POLICY IF EXISTS "Anyone can view gallery photos" ON public.galeria_fotos;
DROP POLICY IF EXISTS "Admins can insert gallery photos" ON public.galeria_fotos;
DROP POLICY IF EXISTS "Admins can update gallery photos" ON public.galeria_fotos;
DROP POLICY IF EXISTS "Admins can delete gallery photos" ON public.galeria_fotos;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Anyone can view gallery photos"
ON public.galeria_fotos FOR SELECT
USING (true);

CREATE POLICY "Admins can insert gallery photos"
ON public.galeria_fotos FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery photos"
ON public.galeria_fotos FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery photos"
ON public.galeria_fotos FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
