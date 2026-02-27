import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Globe, BookOpen, MessageCircle, User, Save, Upload, X, MapPin, Phone, Mail,
  Facebook, Instagram, Youtube, Image as ImageIcon, Type, Quote, Shield, Plus,
} from "lucide-react";
import imageCompression from "browser-image-compression";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SiteConfig {
  nome: string; subtitulo: string; descricao: string;
  hero_imagem: string; hero_boas_vindas: string; hero_titulo: string;
  hero_subtitulo: string; hero_versiculo: string; hero_referencia: string;
  contato_endereco1: string; contato_endereco2: string;
  contato_telefone: string; contato_email: string;
  social_facebook: string; social_instagram: string; social_youtube: string;
}
interface ContatoConfig {
  endereco: string; telefones: string; email: string;
  horarios: string; whatsapp: string;
  social_facebook: string; social_instagram: string; social_youtube: string;
  mapa_url: string;
}
interface SobreConfig { conteudo: string; }

const defaultSite: SiteConfig = {
  nome: "", subtitulo: "", descricao: "",
  hero_imagem: "", hero_boas_vindas: "", hero_titulo: "",
  hero_subtitulo: "", hero_versiculo: "", hero_referencia: "",
  contato_endereco1: "", contato_endereco2: "",
  contato_telefone: "", contato_email: "",
  social_facebook: "", social_instagram: "", social_youtube: "",
};
const defaultContato: ContatoConfig = {
  endereco: "", telefones: "", email: "", horarios: "", whatsapp: "",
  social_facebook: "", social_instagram: "", social_youtube: "", mapa_url: "",
};
const defaultSobre: SobreConfig = { conteudo: "" };

/* ------------------------------------------------------------------ */
/*  Helper: section card wrapper                                       */
/* ------------------------------------------------------------------ */
const Section = ({ icon: Icon, title, desc, children }: {
  icon: React.ElementType; title: string; desc: string; children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-[hsl(38,90%,95%)]">
        <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
      </div>
      <div>
        <h3 className="font-bold text-[hsl(220,30%,20%)]">{title}</h3>
        <p className="text-sm text-[hsl(220,15%,55%)]">{desc}</p>
      </div>
    </div>
    {children}
  </div>
);

const FieldLabel = ({ icon: Icon, label }: { icon?: React.ElementType; label: string }) => (
  <label className="text-sm font-medium text-[hsl(220,30%,25%)] flex items-center gap-1.5">
    {Icon && <Icon className="h-3.5 w-3.5 text-[hsl(220,15%,55%)]" />}
    {label}
  </label>
);

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */
const ConfiguracoesContent = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("site");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingHero, setUploadingHero] = useState(false);

  const [site, setSite] = useState<SiteConfig>(defaultSite);
  const [contato, setContato] = useState<ContatoConfig>(defaultContato);
  const [sobre, setSobre] = useState<SobreConfig>(defaultSobre);

  const heroInputRef = useRef<HTMLInputElement>(null);

  /* ---------- load ---------- */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_config" as any).select("*");
      if (data) {
        for (const row of data as any[]) {
          if (row.key === "site") setSite({ ...defaultSite, ...(row.value as any) });
          if (row.key === "contato") setContato({ ...defaultContato, ...(row.value as any) });
          if (row.key === "sobre") setSobre({ ...defaultSobre, ...(row.value as any) });
        }
      }
      setLoading(false);
    })();
  }, []);

  /* ---------- save ---------- */
  const handleSave = async () => {
    setSaving(true);
    try {
      const key = tab === "site" ? "site" : tab === "contato" ? "contato" : tab === "sobre" ? "sobre" : null;
      const value = tab === "site" ? site : tab === "contato" ? contato : tab === "sobre" ? sobre : null;
      if (key && value) {
        const { error } = await (supabase.from("site_config" as any) as any)
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
        if (error) throw error;
      }
      toast.success("Configurações salvas!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar: " + (err.message || ""));
    }
    setSaving(false);
  };

  /* ---------- hero image upload ---------- */
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 5, maxWidthOrHeight: 1920, useWebWorker: true });
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `hero/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("galeria").upload(fileName, compressed, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("galeria").getPublicUrl(fileName);
      setSite((prev) => ({ ...prev, hero_imagem: pub.publicUrl }));
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + (err.message || ""));
    }
    setUploadingHero(false);
    if (heroInputRef.current) heroInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  const inputCls = "bg-white text-[hsl(220,30%,20%)] border-[hsl(220,20%,88%)] placeholder:text-[hsl(220,15%,65%)]";

  return (
    <div className="[&_input]:bg-white [&_input]:text-[hsl(220,30%,20%)] [&_input]:border-[hsl(220,20%,88%)] [&_textarea]:bg-white [&_textarea]:text-[hsl(220,30%,20%)] [&_textarea]:border-[hsl(220,20%,88%)] [&_button]:border-[hsl(220,20%,88%)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Configurações</h1>
        <p className="text-[hsl(220,15%,55%)]">Gerencie as configurações do site e painel</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 bg-white border border-[hsl(220,20%,90%)]">
          <TabsTrigger value="site" className="gap-1.5 text-[hsl(220,20%,40%)] data-[state=active]:bg-[hsl(218,45%,22%)] data-[state=active]:text-white"><Globe className="h-4 w-4" /> Site</TabsTrigger>
          <TabsTrigger value="sobre" className="gap-1.5 text-[hsl(220,20%,40%)] data-[state=active]:bg-[hsl(218,45%,22%)] data-[state=active]:text-white"><BookOpen className="h-4 w-4" /> Sobre</TabsTrigger>
          <TabsTrigger value="contato" className="gap-1.5 text-[hsl(220,20%,40%)] data-[state=active]:bg-[hsl(218,45%,22%)] data-[state=active]:text-white"><MessageCircle className="h-4 w-4" /> Contato</TabsTrigger>
          <TabsTrigger value="conta" className="gap-1.5 text-[hsl(220,20%,40%)] data-[state=active]:bg-[hsl(218,45%,22%)] data-[state=active]:text-white"><User className="h-4 w-4" /> Conta</TabsTrigger>
        </TabsList>

        {/* ===================== SITE TAB ===================== */}
        <TabsContent value="site" className="space-y-6">
          <Section icon={Globe} title="Identidade do Site" desc="Nome e descrição exibidos no cabeçalho e rodapé">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <FieldLabel label="Nome da Igreja" />
                <Input value={site.nome} onChange={(e) => setSite({ ...site, nome: e.target.value })} />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Subtítulo" />
                <Input value={site.subtitulo} onChange={(e) => setSite({ ...site, subtitulo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <FieldLabel label="Descrição" />
              <Textarea value={site.descricao} onChange={(e) => setSite({ ...site, descricao: e.target.value })} rows={3} />
            </div>
          </Section>

          <Section icon={ImageIcon} title="Seção Hero (Banner Principal)" desc="Imagem de fundo e textos da página inicial">
            <div className="space-y-1">
              <FieldLabel label="Imagem de Fundo" />
              {site.hero_imagem ? (
                <div className="relative w-fit">
                  <img src={site.hero_imagem} alt="Hero" className="rounded-lg max-h-48 object-cover" />
                  <button
                    onClick={() => setSite({ ...site, hero_imagem: "" })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
              <Button variant="outline" onClick={() => heroInputRef.current?.click()} disabled={uploadingHero} className="mt-2">
                <Upload className="h-4 w-4 mr-2" />
                {uploadingHero ? "Enviando..." : "Enviar Imagem"}
              </Button>
              <p className="text-xs text-[hsl(220,15%,55%)]">Tamanho recomendado: 1920x1080. Máximo: 5MB</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <FieldLabel label="Texto de Boas-vindas" />
                <Input value={site.hero_boas_vindas} onChange={(e) => setSite({ ...site, hero_boas_vindas: e.target.value })} />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Título Principal" />
                <Input value={site.hero_titulo} onChange={(e) => setSite({ ...site, hero_titulo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <FieldLabel label="Subtítulo" />
              <Input value={site.hero_subtitulo} onChange={(e) => setSite({ ...site, hero_subtitulo: e.target.value })} />
            </div>
            <div className="space-y-1">
              <FieldLabel icon={Quote} label="Versículo" />
              <Textarea value={site.hero_versiculo} onChange={(e) => setSite({ ...site, hero_versiculo: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1">
              <FieldLabel label="Referência do Versículo" />
              <Input value={site.hero_referencia} onChange={(e) => setSite({ ...site, hero_referencia: e.target.value })} />
            </div>
          </Section>

          <Section icon={MapPin} title="Informações de Contato" desc="Endereço, telefone e e-mail exibidos no rodapé">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <FieldLabel icon={MapPin} label="Endereço (Linha 1)" />
                <Input value={site.contato_endereco1} onChange={(e) => setSite({ ...site, contato_endereco1: e.target.value })} />
              </div>
              <div className="space-y-1">
                <FieldLabel label="Endereço (Linha 2)" />
                <Input value={site.contato_endereco2} onChange={(e) => setSite({ ...site, contato_endereco2: e.target.value })} placeholder="Centro - Cidade/UF" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <FieldLabel icon={Phone} label="Telefone" />
                <Input value={site.contato_telefone} onChange={(e) => setSite({ ...site, contato_telefone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <FieldLabel icon={Mail} label="E-mail" />
                <Input value={site.contato_email} onChange={(e) => setSite({ ...site, contato_email: e.target.value })} />
              </div>
            </div>
          </Section>

          <Section icon={Instagram} title="Redes Sociais" desc="Links para as redes sociais da igreja">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <FieldLabel icon={Facebook} label="Facebook" />
                <Input value={site.social_facebook} onChange={(e) => setSite({ ...site, social_facebook: e.target.value })} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-1">
                <FieldLabel icon={Instagram} label="Instagram" />
                <Input value={site.social_instagram} onChange={(e) => setSite({ ...site, social_instagram: e.target.value })} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-1">
                <FieldLabel icon={Youtube} label="YouTube" />
                <Input value={site.social_youtube} onChange={(e) => setSite({ ...site, social_youtube: e.target.value })} placeholder="https://youtube.com/c/..." />
              </div>
            </div>
          </Section>
        </TabsContent>

        {/* ===================== SOBRE TAB ===================== */}
        <TabsContent value="sobre" className="space-y-6">
          <Section icon={BookOpen} title="Página Sobre" desc="Conteúdo exibido na página 'Sobre' do site">
            <div className="space-y-1">
              <FieldLabel label="Conteúdo (HTML permitido)" />
              <Textarea value={sobre.conteudo} onChange={(e) => setSobre({ ...sobre, conteudo: e.target.value })} rows={12} />
            </div>
          </Section>
        </TabsContent>

        {/* ===================== CONTATO TAB ===================== */}
        <TabsContent value="contato" className="space-y-6">
          <Section icon={MessageCircle} title="Informações de Contato" desc="Dados exibidos na página de Contato">
            <div className="space-y-1">
              <FieldLabel icon={MapPin} label="Endereço (use Enter para quebrar linha)" />
              <Textarea value={contato.endereco} onChange={(e) => setContato({ ...contato, endereco: e.target.value })} rows={3} placeholder="Rua Exemplo, 123\nBairro Centro\nCidade - Estado, CEP 00000-000" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <FieldLabel icon={Phone} label="Telefone(s) (use Enter para quebrar linha)" />
                <Textarea value={contato.telefones} onChange={(e) => setContato({ ...contato, telefones: e.target.value })} rows={3} placeholder="(00) 0000-0000\n(00) 00000-0000" />
              </div>
              <div className="space-y-1">
                <FieldLabel icon={Mail} label="E-mail" />
                <Input value={contato.email} onChange={(e) => setContato({ ...contato, email: e.target.value })} placeholder="contato@tabernaculo.com" />
              </div>
            </div>
            <div className="space-y-1">
              <FieldLabel label="Horários dos Cultos (use Enter para quebrar linha)" />
              <Textarea value={contato.horarios} onChange={(e) => setContato({ ...contato, horarios: e.target.value })} rows={4} placeholder="Domingo: 09h e 19h\nQuarta-feira: 19h30\nSexta-feira: 20h" />
            </div>
            <div className="space-y-1">
              <FieldLabel icon={MessageCircle} label="WhatsApp (apenas números com código do país)" />
              <Input value={contato.whatsapp} onChange={(e) => setContato({ ...contato, whatsapp: e.target.value })} placeholder="5500000000000" />
            </div>
          </Section>

          <Section icon={Instagram} title="Redes Sociais (Página de Contato)" desc="Links exibidos na página de Contato">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <FieldLabel icon={Facebook} label="Facebook" />
                <Input value={contato.social_facebook} onChange={(e) => setContato({ ...contato, social_facebook: e.target.value })} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-1">
                <FieldLabel icon={Instagram} label="Instagram" />
                <Input value={contato.social_instagram} onChange={(e) => setContato({ ...contato, social_instagram: e.target.value })} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-1">
                <FieldLabel icon={Youtube} label="YouTube" />
                <Input value={contato.social_youtube} onChange={(e) => setContato({ ...contato, social_youtube: e.target.value })} placeholder="https://youtube.com/..." />
              </div>
            </div>
          </Section>

          <Section icon={MapPin} title="Mapa" desc="URL de incorporação do Google Maps">
            <div className="space-y-1">
              <FieldLabel label="URL do Embed do Mapa" />
              <Input value={contato.mapa_url} onChange={(e) => setContato({ ...contato, mapa_url: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=..." />
              <p className="text-xs text-[hsl(220,15%,55%)]">Acesse o Google Maps, clique em "Compartilhar", selecione "incorporar mapa" e copie apenas a URL do src.</p>
            </div>
            {contato.mapa_url && (
              <iframe
                src={contato.mapa_url}
                className="w-full h-64 rounded-lg border border-[hsl(220,20%,90%)]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </Section>
        </TabsContent>

        {/* ===================== CONTA TAB ===================== */}
        <TabsContent value="conta" className="space-y-6">
          <Section icon={User} title="Minha Conta" desc="">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[hsl(38,90%,95%)] flex items-center justify-center">
                <User className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(220,30%,20%)]">Minha Conta</p>
                <p className="text-sm text-[hsl(220,15%,55%)]">{user?.email}</p>
              </div>
            </div>
          </Section>

          <Section icon={Shield} title="Gerenciar Administradores" desc="Adicione novos administradores ao sistema">
            <Button variant="outline" className="border-[hsl(220,20%,90%)]">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Administrador
            </Button>
          </Section>
        </TabsContent>
      </Tabs>

      {/* Save button – visible on all tabs except "conta" */}
      {tab !== "conta" && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesContent;
