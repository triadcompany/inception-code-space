-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage gallery photos" ON public.galeria_fotos;
DROP POLICY IF EXISTS "Gallery photos viewable by everyone" ON public.galeria_fotos;

-- Create PERMISSIVE policies (default behavior)
CREATE POLICY "Anyone can view gallery photos"
ON public.galeria_fotos FOR SELECT
USING (true);

CREATE POLICY "Admins can insert gallery photos"
ON public.galeria_fotos FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery photos"
ON public.galeria_fotos FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery photos"
ON public.galeria_fotos FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for galeria bucket
CREATE POLICY "Anyone can view galeria files"
ON storage.objects FOR SELECT
USING (bucket_id = 'galeria');

CREATE POLICY "Admins can upload to galeria"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'galeria' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete from galeria"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'galeria' AND public.has_role(auth.uid(), 'admin'::app_role));