
-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Admins can manage cultos" ON public.cultos;
DROP POLICY IF EXISTS "Authenticated can view published cultos" ON public.cultos;
DROP POLICY IF EXISTS "Public can view published cultos" ON public.cultos;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can manage cultos"
ON public.cultos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view published cultos"
ON public.cultos
FOR SELECT
TO anon
USING (status = 'publicado'::text);

CREATE POLICY "Authenticated can view published cultos"
ON public.cultos
FOR SELECT
TO authenticated
USING (status = 'publicado'::text);
