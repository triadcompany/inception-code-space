import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listPaginas, updatePagina } from "@/lib/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Loader2, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "./RichTextEditor";

type Pagina = {
  id: string;
  slug: string;
  titulo: string;
  conteudo: string | null;
  updated_at: string;
};

const SLUG_TO_PATH: Record<string, string> = {
  sobre: "/sobre",
  "20-anos": "/sobre/20-anos",
  "o-inicio": "/sobre/o-inicio",
  "cultos-especiais": "/sobre/20-anos/cultos-especiais",
};

const PaginasContent = () => {
  const [editing, setEditing] = useState<Pagina | null>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: paginas, isLoading } = useQuery({
    queryKey: ["admin_paginas"],
    queryFn: async () => {
      const { data, error } = await listPaginas();
      if (error) throw new Error(error.message);
      return (data ?? []) as Pagina[];
    },
  });

  const startEditing = (pagina: Pagina) => {
    setEditing(pagina);
    setTitulo(pagina.titulo);
    setConteudo(pagina.conteudo || "");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { error } = await updatePagina(editing.id, { titulo, conteudo });
      if (error) throw new Error(error.message);
      queryClient.invalidateQueries({ queryKey: ["admin_paginas"] });
      queryClient.invalidateQueries({ queryKey: ["pagina", editing.slug] });
      toast.success("Página salva com sucesso!");
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar página.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(220,30%,20%)]">Editar Página</h1>
              <p className="text-sm text-[hsl(220,15%,55%)]">/{editing.slug}</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(220,20%,30%)] mb-1">Título</label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[hsl(220,20%,30%)] mb-1">Conteúdo</label>
            <RichTextEditor content={conteudo} onChange={setConteudo} minHeight="400px" placeholder="Escreva o conteúdo da página..." />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(220,30%,20%)]">Páginas</h1>
          <p className="text-[hsl(220,15%,55%)]">Gerencie o conteúdo das páginas do site</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[hsl(220,20%,93%)] animate-pulse" />
          ))}
        </div>
      ) : paginas && paginas.length > 0 ? (
        <div className="space-y-3">
          {paginas.map((pagina) => (
            <div
              key={pagina.id}
              className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-5 flex items-center justify-between hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm transition-all cursor-pointer"
              onClick={() => startEditing(pagina)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(220,30%,20%)]">{pagina.titulo}</h3>
                  <p className="text-xs text-[hsl(220,15%,55%)]">
                    /{pagina.slug}
                    {pagina.conteudo ? " • Conteúdo editado" : " • Sem conteúdo personalizado"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {SLUG_TO_PATH[pagina.slug] && (
                  <a
                    href={SLUG_TO_PATH[pagina.slug]}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[hsl(220,15%,55%)] hover:text-[hsl(var(--primary))] transition-colors p-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); startEditing(pagina); }}>
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
          <FileText className="w-10 h-10 text-[hsl(220,20%,80%)] mx-auto mb-3" />
          <p className="text-[hsl(220,15%,55%)]">Nenhuma página cadastrada ainda.</p>
        </div>
      )}
    </>
  );
};

export default PaginasContent;
