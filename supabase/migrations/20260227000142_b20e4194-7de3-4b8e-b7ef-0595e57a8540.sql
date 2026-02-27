
-- Drop existing RESTRICTIVE policies on estudos
DROP POLICY IF EXISTS "Admins can manage estudos" ON public.estudos;
DROP POLICY IF EXISTS "Authenticated can view published estudos" ON public.estudos;
DROP POLICY IF EXISTS "Public can view published estudos" ON public.estudos;

-- Recreate as PERMISSIVE
CREATE POLICY "Admins can manage estudos"
ON public.estudos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view published estudos"
ON public.estudos
FOR SELECT
TO anon
USING (publicado = true);

CREATE POLICY "Authenticated can view published estudos"
ON public.estudos
FOR SELECT
TO authenticated
USING (publicado = true);
