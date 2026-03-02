import { useState, useEffect, lazy, Suspense } from "react";
import { Plus, Trash2, ExternalLink, Pencil, Youtube, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import AnimatedSection from "./AnimatedSection";

const NovoCultoModal = lazy(() => import("./NovoCultoModal"));
const EditCultoModal = lazy(() => import("./EditCultoModal"));

interface Culto {
  id: string;
  titulo: string;
  data: string;
  pregador: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
}

const PAGE_SIZE = 30;

const CultosContent = () => {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCulto, setEditCulto] = useState<Culto | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const { toast } = useToast();
  const { data: siteConfig } = useSiteConfig();

  const fetchCultos = async (pageNum = 0, append = false) => {
    if (pageNum === 0) setLoading(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("cultos")
      .select("id, titulo, data, pregador, video_url, thumbnail_url, status, created_at, tipo, tag_jovem_id, tag_geral_id")
      .order("data", { ascending: false });

    if (searchTitle.trim()) {
      query = query.ilike("titulo", `%${searchTitle.trim()}%`);
    }
    if (filterYear && filterYear !== "all") {
      query = query.gte("data", `${filterYear}-01-01`).lte("data", `${filterYear}-12-31`);
    }

    const { data, error } = await query.range(from, to);

    if (error) {
      toast({ title: "Erro ao carregar cultos", description: error.message, variant: "destructive" });
    } else {
      const items = (data as any) || [];
      setCultos(prev => append ? [...prev, ...items] : items);
      setHasMore(items.length === PAGE_SIZE);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(0);
    fetchCultos(0);
  }, [searchTitle, filterYear]);

  const handleRefresh = () => {
    setPage(0);
    fetchCultos(0);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchCultos(next, true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este culto?")) return;
    const { error } = await supabase.from("cultos").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Culto excluído" });
      setCultos(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "publicado" ? "inativo" : "publicado";
    const { error } = await supabase.from("cultos").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Culto ${newStatus === "publicado" ? "publicado" : "inativado"}` });
      setCultos(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleYouTubeImport = async (mode: "live" | "videos" = "live", years?: number[]) => {
    const channelId = siteConfig?.youtube_channel_id;
    if (!channelId) {
      toast({
        title: "Channel ID não configurado",
        description: "Vá em Configurações → Site → YouTube e preencha o Channel ID.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    let totalImported = 0;
    let totalSkipped = 0;
    let pageToken: string | undefined;

    try {
      do {
        const { data, error } = await supabase.functions.invoke("youtube-import", {
          body: { channelId, pageToken, mode, years },
        });

        if (error) throw new Error(error.message);
        if (!data?.success) throw new Error(data?.error || "Erro desconhecido");

        totalImported += data.imported;
        totalSkipped += data.skipped;
        pageToken = data.nextPageToken || undefined;

        if (pageToken) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      } while (pageToken);

      toast({
        title: "Importação concluída!",
        description: `${totalImported} culto(s) importado(s), ${totalSkipped} ignorado(s).`,
      });

      if (totalImported > 0) {
        setPage(0);
        fetchCultos(0);
      }
    } catch (err: any) {
      console.error("YouTube import error:", err);
      toast({
        title: "Erro na importação",
        description: err.message || "Erro ao importar do YouTube",
        variant: "destructive",
      });
    }
    setImporting(false);
  };

  return (
    <>
      <AnimatedSection>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Cultos</h1>
            <p className="text-[hsl(220,15%,55%)]">Gerencie os cultos da igreja</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleYouTubeImport("live")}
              disabled={importing}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:shadow-sm active:scale-[0.97] transition-all duration-200"
            >
              {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Youtube className="h-4 w-4 mr-2" />}
              {importing ? "Importando..." : "Importar Lives"}
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white hover:shadow-md active:scale-[0.97] transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Culto
            </Button>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={50}>
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por título..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {Array.from({ length: 13 }, (_, i) => 2026 - i).map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AnimatedSection>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
        </div>
      ) : cultos.length === 0 ? (
        <AnimatedSection delay={100}>
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
            <p className="text-[hsl(220,15%,55%)]">Nenhum culto cadastrado ainda.</p>
            <Button
              onClick={() => setModalOpen(true)}
              variant="outline"
              className="mt-4 border-[hsl(218,45%,22%)] text-[hsl(218,45%,22%)] hover:shadow-sm active:scale-[0.97] transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Culto
            </Button>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection delay={100}>
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] divide-y divide-[hsl(220,20%,93%)] overflow-hidden">
            {cultos.map((culto, i) => (
              <div
                key={culto.id}
                className="flex items-center gap-4 p-4 hover:bg-[hsl(220,20%,98%)] transition-all duration-200 group"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {culto.thumbnail_url ? (
                  <img src={culto.thumbnail_url} alt={culto.titulo} className="w-24 h-14 rounded-lg object-cover flex-shrink-0 group-hover:shadow-md transition-shadow duration-300" loading="lazy" />
                ) : (
                  <div className="w-24 h-14 rounded-lg bg-[hsl(220,20%,93%)] flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-[hsl(220,15%,65%)]">Sem thumb</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[hsl(220,30%,20%)] truncate">{culto.titulo}</p>
                  <p className="text-xs text-[hsl(220,15%,55%)]">
                    {formatDate(culto.data)}
                    {culto.pregador && ` • ${culto.pregador}`}
                  </p>
                </div>
                <button
                  onClick={() => toggleStatus(culto.id, culto.status)}
                  className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-all duration-200 hover:shadow-sm active:scale-95 ${
                    culto.status === "publicado"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                  title={culto.status === "publicado" ? "Clique para inativar" : "Clique para publicar"}
                >
                  {culto.status === "publicado" ? "PUBLICADO" : "INATIVO"}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditCulto(culto)} className="p-2 rounded-lg hover:bg-[hsl(220,20%,93%)] text-[hsl(220,15%,55%)] hover:text-[hsl(220,30%,20%)] active:scale-90 transition-all duration-200" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  {culto.video_url && (
                    <a href={culto.video_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[hsl(220,20%,93%)] text-[hsl(220,15%,55%)] hover:text-[hsl(220,30%,20%)] transition-all duration-200">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(culto.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 active:scale-90 transition-all duration-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-4">
              <Button variant="outline" onClick={loadMore} className="border-[hsl(220,20%,85%)] text-[hsl(220,30%,20%)] hover:shadow-sm active:scale-[0.97] transition-all duration-200">
                Carregar mais
              </Button>
            </div>
          )}
        </AnimatedSection>
      )}

      {modalOpen && (
        <Suspense fallback={null}>
          <NovoCultoModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={handleRefresh} />
        </Suspense>
      )}

      {editCulto && (
        <Suspense fallback={null}>
          <EditCultoModal
            open={!!editCulto}
            onOpenChange={(open) => { if (!open) setEditCulto(null); }}
            onSuccess={handleRefresh}
            culto={editCulto}
          />
        </Suspense>
      )}
    </>
  );
};

export default CultosContent;
