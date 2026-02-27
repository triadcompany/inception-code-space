import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteConfig {
  nome: string; subtitulo: string; descricao: string;
  hero_imagem: string; hero_boas_vindas: string; hero_titulo: string;
  hero_subtitulo: string; hero_versiculo: string; hero_referencia: string;
  contato_endereco1: string; contato_endereco2: string;
  contato_telefone: string; contato_email: string;
  social_facebook: string; social_instagram: string; social_youtube: string;
}

export interface ContatoConfig {
  endereco: string; telefones: string; email: string;
  horarios: string; whatsapp: string;
  social_facebook: string; social_instagram: string; social_youtube: string;
  mapa_url: string;
}

const defaultSite: SiteConfig = {
  nome: "Tabernáculo", subtitulo: "O Filho do Homem",
  descricao: "Uma comunidade de fé dedicada a proclamar a mensagem de Cristo e servir ao próximo com amor.",
  hero_imagem: "", hero_boas_vindas: "Bem-vindo ao", hero_titulo: "Tabernáculo",
  hero_subtitulo: "O Filho do Homem",
  hero_versiculo: "E disse-me: Não seles as palavras da profecia deste livro; porque próximo está o tempo.",
  hero_referencia: "Apocalipse 22:10",
  contato_endereco1: "R. Guilherme Bauer, 403, Schroeder/SC.",
  contato_endereco2: "",
  contato_telefone: "(47) 98810-3818",
  contato_email: "contato@tabernaculoofh.com",
  social_facebook: "", social_instagram: "", social_youtube: "",
};

const defaultContato: ContatoConfig = {
  endereco: "R. Guilherme Bauer, 403\nBairro Centro\nSchroeder/SC",
  telefones: "(47) 98810-3818",
  email: "contato@tabernaculo.com",
  horarios: "Domingo: 09h e 19h\nQuarta-feira: 19h30\nSexta-feira: 20h",
  whatsapp: "5547988103818",
  social_facebook: "", social_instagram: "", social_youtube: "",
  mapa_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.0!2d-49.0734!3d-26.4153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDI0JzU1LjEiUyA0OcKwMDQnMjQuMiJX!5e0!3m2!1spt-BR!2sbr!4v1",
};

async function fetchConfig<T>(key: string, defaults: T): Promise<T> {
  const { data } = await supabase
    .from("site_config" as any)
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (!data) return defaults;
  const v = (data as any).value as Record<string, any>;
  const result = { ...defaults } as any;
  for (const k of Object.keys(result)) {
    if (v[k] !== undefined && v[k] !== "") result[k] = v[k];
  }
  return result;
}

export function useSiteConfig() {
  return useQuery<SiteConfig>({
    queryKey: ["site_config", "site"],
    queryFn: () => fetchConfig("site", defaultSite),
    staleTime: 1000 * 60 * 5,
  });
}

export function useContatoConfig() {
  return useQuery<ContatoConfig>({
    queryKey: ["site_config", "contato"],
    queryFn: () => fetchConfig("contato", defaultContato),
    staleTime: 1000 * 60 * 5,
  });
}
