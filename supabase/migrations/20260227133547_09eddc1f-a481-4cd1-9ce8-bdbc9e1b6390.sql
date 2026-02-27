-- Drop all existing restrictive policies on galeria_fotos
DROP POLICY IF EXISTS "Admins can delete gallery photos" ON public.galeria_fotos;
DROP POLICY IF EXISTS "Admins can insert gallery photos" ON public.galeria_fotos;
DROP POLICY IF EXISTS "Admins can update gallery photos" ON public.galeria_fotos;
DROP POLICY IF EXISTS "Anyone can view gallery photos" ON public.galeria_fotos;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Anyone can view gallery photos"
ON public.galeria_fotos
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert gallery photos"
ON public.galeria_fotos
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery photos"
ON public.galeria_fotos
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery photos"
ON public.galeria_fotos
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also fix storage policies for the galeria bucket
-- Drop any existing restrictive policies on storage.objects for galeria
DROP POLICY IF EXISTS "Admin galeria upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin galeria delete" ON storage.objects;
DROP POLICY IF EXISTS "Public galeria read" ON storage.objects;

-- Recreate as PERMISSIVE
CREATE POLICY "Public galeria read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'galeria');

CREATE POLICY "Admin galeria upload"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'galeria' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin galeria delete"
ON storage.objects
FOR DELETE
USING (bucket_id = 'galeria' AND has_role(auth.uid(), 'admin'::app_role));