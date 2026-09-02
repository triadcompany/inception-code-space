// Gallery sections. `key` is the value stored in `galeria_fotos.categoria`;
// `label` / `heading` are display-only, so renaming a section needs no DB change.

export interface GaleriaSection {
  key: string;
  label: string;
  heading: string;
}

export const GALERIA_SECTIONS: GaleriaSection[] = [
  { key: "Sexta", label: "Sexta", heading: "Culto de Sexta" },
  { key: "Sábado", label: "Sábado", heading: "Culto de Sábado" },
  { key: "Domingo", label: "Confraternização", heading: "Confraternização" },
];

export const sectionHeading = (key: string): string =>
  GALERIA_SECTIONS.find((s) => s.key === key)?.heading ?? key;

export const sectionLabel = (key: string): string =>
  GALERIA_SECTIONS.find((s) => s.key === key)?.label ?? key;
