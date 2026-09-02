// Typed resource helpers over `api`. Return shapes are snake_case, matching what
// the components previously received from Supabase/PostgREST.

import { api, apiRequest, type ApiResult } from "./api";

/* ------------------------------------------------------------------ types --- */

export interface Culto {
  id: string;
  titulo: string;
  data: string;
  pregador: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  descricao: string | null;
  resumo: string | null;
  status: string;
  tipo: string;
  tema_id: string | null;
  tag_jovem_id: string | null;
  tag_geral_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conteudo {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  conteudo: string | null;
  publicado: boolean;
  tema_id?: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tema {
  id: string;
  nome: string;
  descricao: string | null;
  ordem: number | null;
  publicado: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagina {
  id: string;
  slug: string;
  titulo: string;
  conteudo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  nome: string;
  created_at: string;
}

export interface GaleriaFoto {
  id: string;
  url: string;
  categoria: string;
  descricao: string | null;
  ordem: number | null;
  created_at: string;
}

export interface Usuario {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  approved: boolean;
  created_at: string;
  roles: string[];
}

export interface CultoListParams {
  search?: string;
  tipo?: string;
  status?: string;
  year?: string | number;
  order?: "data" | "created_at" | "titulo";
  dir?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/* --------------------------------------------------------------- generic --- */

function crud<T>(base: string) {
  return {
    list: (query?: Record<string, string | number | boolean | undefined>) =>
      api.get<T[]>(base, query),
    get: (id: string) => api.get<T>(`${base}/${id}`),
    create: (body: Partial<T> | Record<string, unknown>) => api.post<T>(base, body),
    update: (id: string, body: Partial<T> | Record<string, unknown>) =>
      api.patch<T>(`${base}/${id}`, body),
    remove: (id: string) => api.del<{ success: boolean }>(`${base}/${id}`),
  };
}

/* --------------------------------------------------------------- cultos ---- */

const cultosCrud = crud<Culto>("/cultos");
export const listCultos = (p: CultoListParams = {}) =>
  cultosCrud.list(p as Record<string, string | number | undefined>);
export const getCulto = (id: string) => cultosCrud.get(id);
export const createCulto = cultosCrud.create;
export const updateCulto = cultosCrud.update;
export const deleteCulto = cultosCrud.remove;

/* --------------------------------------------------- doutrinas / estudos --- */

const doutrinasCrud = crud<Conteudo>("/doutrinas");
export const listDoutrinas = (p?: Record<string, string | number | undefined>) => doutrinasCrud.list(p);
export const getDoutrina = doutrinasCrud.get;
export const createDoutrina = doutrinasCrud.create;
export const updateDoutrina = doutrinasCrud.update;
export const deleteDoutrina = doutrinasCrud.remove;

const estudosCrud = crud<Conteudo>("/estudos");
export const listEstudos = (p?: Record<string, string | number | undefined>) => estudosCrud.list(p);
export const getEstudo = estudosCrud.get;
export const createEstudo = estudosCrud.create;
export const updateEstudo = estudosCrud.update;
export const deleteEstudo = estudosCrud.remove;

/* ---------------------------------------------------------------- temas ---- */

const temasCrud = crud<Tema>("/temas");
export const listTemas = (p?: Record<string, string | number | undefined>) => temasCrud.list(p);
export const createTema = temasCrud.create;
export const updateTema = temasCrud.update;
export const deleteTema = temasCrud.remove;

/* -------------------------------------------------------------- paginas ---- */

const paginasCrud = crud<Pagina>("/paginas");
export const listPaginas = () => paginasCrud.list();
export const getPaginaBySlug = (slug: string) => api.get<Pagina>(`/paginas/slug/${slug}`);
export const createPagina = paginasCrud.create;
export const updatePagina = paginasCrud.update;
export const deletePagina = paginasCrud.remove;

/* ----------------------------------------------------------- site-config --- */

export interface SiteConfigRow {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export const listSiteConfig = () => api.get<SiteConfigRow[]>("/site-config");

export async function getSiteConfigValue(
  key: string,
): Promise<ApiResult<Record<string, unknown> | null>> {
  const { data, error } = await api.get<SiteConfigRow>(`/site-config/${key}`);
  if (error && error.status === 404) return { data: null, error: null };
  if (error) return { data: null, error };
  return { data: data?.value ?? null, error: null };
}

export const saveSiteConfig = (key: string, value: Record<string, unknown>) =>
  api.put<SiteConfigRow>(`/site-config/${key}`, { value });

/* ----------------------------------------------------------------- tags ---- */

export const listTagsGerais = () => api.get<Tag[]>("/tags-gerais");
export const createTagGeral = (nome: string) => api.post<Tag>("/tags-gerais", { nome });
export const deleteTagGeral = (id: string) => api.del(`/tags-gerais/${id}`);

export const listTagsJovens = () => api.get<Tag[]>("/tags-jovens");
export const createTagJovem = (nome: string) => api.post<Tag>("/tags-jovens", { nome });
export const deleteTagJovem = (id: string) => api.del(`/tags-jovens/${id}`);

/* -------------------------------------------------------------- galeria ---- */

export const listGaleriaFotos = (categoria?: string) =>
  api.get<GaleriaFoto[]>("/galeria-fotos", categoria ? { categoria } : undefined);
export const getGaleriaCounts = () => api.get<Record<string, number>>("/galeria-fotos/counts");
export const createGaleriaFoto = (body: Partial<GaleriaFoto>) =>
  api.post<GaleriaFoto>("/galeria-fotos", body);
export const deleteGaleriaFoto = (id: string) => api.del(`/galeria-fotos/${id}`);

/* ------------------------------------------------------------- usuarios ---- */

export const listUsuarios = () => api.get<Usuario[]>("/usuarios");
export const updateUsuario = (id: string, body: { approved?: boolean; display_name?: string }) =>
  api.patch<Usuario>(`/usuarios/${id}`, body);
export const deleteUsuario = (id: string) => api.del<{ success: boolean }>(`/usuarios/${id}`);

/* -------------------------------------------------------------- youtube ---- */

export interface YoutubeImportBody {
  channelId: string;
  pageToken?: string;
  mode?: "live" | "videos";
  years?: number[];
}

export const youtubeImport = (body: YoutubeImportBody) =>
  api.post<{
    success: true;
    imported: number;
    skipped: number;
    total: number;
    nextPageToken: string | null;
    hasMore: boolean;
  }>("/youtube/import", body);

export const getYoutubeLive = () =>
  api.get<{ live: boolean; videoId: string | null; title: string | null; thumbnail: string | null }>(
    "/youtube/live",
  );

export const runYoutubeLiveCheck = () => apiRequest("/youtube/live-check", { method: "POST" });
