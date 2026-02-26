import { useState, useEffect, lazy, Suspense } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NovoCultoModal = lazy(() => import("./NovoCultoModal"));

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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchCultos = async (pageNum = 0, append = false) => {
    if (pageNum === 0) setLoading(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("cultos" as any)
      .select("id, titulo, data, pregador, video_url, thumbnail_url, status, created_at")
      .order("data", { ascending: false })
      .range(from, to);

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
    fetchCultos(0);
  }, []);

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
    const { error } = await supabase.from("cultos" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Culto excluído" });
      setCultos(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "publicado" ? "inativo" : "publicado";
    const { error } = await supabase.from("cultos" as any).update({ status: newStatus } as any).eq("id", id);
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

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Cultos</h1>
          <p className="text-[hsl(220,15%,55%)]">Gerencie os cultos da igreja</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Culto
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
        </div>
      ) : cultos.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
          <p className="text-[hsl(220,15%,55%)]">Nenhum culto cadastrado ainda.</p>
          <Button
            onClick={() => setModalOpen(true)}
            variant="outline"
            className="mt-4 border-[hsl(218,45%,22%)] text-[hsl(218,45%,22%)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Culto
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] divide-y divide-[hsl(220,20%,93%)]">
            {cultos.map((culto) => (
              <div key={culto.id} className="flex items-center gap-4 p-4 hover:bg-[hsl(220,20%,98%)] transition-colors">
                {culto.thumbnail_url ? (
                  <img src={culto.thumbnail_url} alt={culto.titulo} className="w-24 h-14 rounded-lg object-cover flex-shrink-0" loading="lazy" />
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
                  className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                    culto.status === "publicado"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                  title={culto.status === "publicado" ? "Clique para inativar" : "Clique para publicar"}
                >
                  {culto.status === "publicado" ? "PUBLICADO" : "INATIVO"}
                </button>
                <div className="flex items-center gap-1">
                  {culto.video_url && (
                    <a href={culto.video_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[hsl(220,20%,93%)] text-[hsl(220,15%,55%)]">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(culto.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-4">
              <Button variant="outline" onClick={loadMore} className="border-[hsl(220,20%,85%)] text-[hsl(220,30%,20%)]">
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <Suspense fallback={null}>
          <NovoCultoModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={handleRefresh} />
        </Suspense>
      )}
    </>
  );
};

export default CultosContent;
