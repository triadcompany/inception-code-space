-- Remove date patterns (dd/mm/yyyy, dd/mm/yy, d/m/yy, etc.) from culto titles
-- Also removes leading/trailing pipes and whitespace left behind
UPDATE cultos 
SET titulo = TRIM(BOTH ' ' FROM TRIM(BOTH '|' FROM TRIM(REGEXP_REPLACE(titulo, '\s*\|?\s*\d{1,2}/\d{1,2}/\d{2,4}\s*', '', 'g'))))
WHERE titulo ~ '\d{1,2}/\d{1,2}/\d{2,4}';