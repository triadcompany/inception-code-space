-- Remove all double quotes from culto titles
UPDATE cultos 
SET titulo = REPLACE(titulo, '"', '')
WHERE titulo LIKE '%"%';

-- Set pregador to 'Pr. Rafael Delmonego' for all cultos
UPDATE cultos 
SET pregador = 'Pr. Rafael Delmonego';