import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import NovaDoutrinaModal from "./NovaDoutrinaModal";
import EditDoutrinaModal from "./EditDoutrinaModal";
import { useToast } from "@/hooks/use-toast";
import AnimatedSection from "./AnimatedSection";

interface Doutrina {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  conteudo?: string | null;
  publicado: boolean;
  created_at: string;
}

const DoutrinasContent = () => {
  const [doutrinas, setDoutrinas] = useState<Doutrina[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doutrina | null>(null);
  const { toast } = useToast();

  const fetchDoutrinas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("doutrinas" as any)
      .select("id, titulo, autor, data, resumo, conteudo, publicado, created_at")
      .order("data", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar doutrinas", description: error.message, variant: "destructive" });
    } else {
      setDoutrinas((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDoutrinas(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const { error } = await supabase.from("doutrinas" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Doutrina excluída" });
      fetchDoutrinas();
    }
  };

  const togglePublicado = async (id: string, current: boolean) => {
    const { error } = await supabase.from("doutrinas" as any).update({ publicado: !current } as any).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Doutrina ${!current ? "publicada" : "inativada"}` });
      fetchDoutrinas();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <>
      <AnimatedSection>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Doutrina</h1>
            <p className="text-[hsl(220,15%,55%)]">Gerencie os estudos doutrinários</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white hover:shadow-md active:scale-[0.97] transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" /> Nova Doutrina
          </Button>
        </div>
      </AnimatedSection>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
        </div>
      ) : doutrinas.length === 0 ? (
        <AnimatedSection delay={100}>
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
            <p className="text-[hsl(220,15%,55%)]">Nenhum item cadastrado ainda.</p>
            <Button onClick={() => setModalOpen(true)} variant="outline" className="mt-4 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:shadow-sm active:scale-[0.97] transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" /> Nova Doutrina
            </Button>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection delay={100}>
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] divide-y divide-[hsl(220,20%,93%)] overflow-hidden">
            {doutrinas.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-[hsl(220,20%,98%)] transition-all duration-200 group">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[hsl(220,30%,20%)] truncate">{item.titulo}</p>
                  <p className="text-xs text-[hsl(220,15%,55%)]">{formatDate(item.data)} • {item.autor}</p>
                  {item.resumo && <p className="text-xs text-[hsl(220,15%,65%)] mt-1 truncate">{item.resumo}</p>}
                </div>
                <button
                  onClick={() => togglePublicado(item.id, item.publicado)}
                  className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-all duration-200 hover:shadow-sm active:scale-95 ${
                    item.publicado ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                  title={item.publicado ? "Clique para inativar" : "Clique para publicar"}
                >
                  {item.publicado ? "PUBLICADO" : "INATIVO"}
                </button>
                <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-[hsl(220,20%,93%)] text-[hsl(220,15%,55%)] hover:text-[hsl(var(--primary))] active:scale-90 transition-all duration-200" title="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 active:scale-90 transition-all duration-200">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </AnimatedSection>
      )}

      <NovaDoutrinaModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchDoutrinas} />
      <EditDoutrinaModal doutrina={editing} open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null); }} onSuccess={fetchDoutrinas} />
    </>
  );
};

export default DoutrinasContent;
