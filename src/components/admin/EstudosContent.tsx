import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import NovoEstudoModal from "./NovoEstudoModal";
import { useToast } from "@/hooks/use-toast";

interface Estudo {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  publicado: boolean;
  created_at: string;
}

const EstudosContent = () => {
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchEstudos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("estudos" as any)
      .select("id, titulo, autor, data, resumo, publicado, created_at")
      .order("data", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar estudos", description: error.message, variant: "destructive" });
    } else {
      setEstudos((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEstudos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este estudo?")) return;
    const { error } = await supabase.from("estudos" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Estudo excluído" });
      fetchEstudos();
    }
  };

  const togglePublicado = async (id: string, current: boolean) => {
    const { error } = await supabase.from("estudos" as any).update({ publicado: !current } as any).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Estudo ${!current ? "publicado" : "inativado"}` });
      fetchEstudos();
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
          <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Estudos Bíblicos</h1>
          <p className="text-[hsl(220,15%,55%)]">Gerencie os estudos bíblicos</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Estudo
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
        </div>
      ) : estudos.length === 0 ? (
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
          <p className="text-[hsl(220,15%,55%)]">Nenhum item cadastrado ainda.</p>
          <Button
            onClick={() => setModalOpen(true)}
            variant="outline"
            className="mt-4 border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Estudo
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] divide-y divide-[hsl(220,20%,93%)]">
          {estudos.map((estudo) => (
            <div key={estudo.id} className="flex items-center gap-4 p-4 hover:bg-[hsl(220,20%,98%)] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[hsl(220,30%,20%)] truncate">{estudo.titulo}</p>
                <p className="text-xs text-[hsl(220,15%,55%)]">
                  {formatDate(estudo.data)} • {estudo.autor}
                </p>
                {estudo.resumo && (
                  <p className="text-xs text-[hsl(220,15%,65%)] mt-1 truncate">{estudo.resumo}</p>
                )}
              </div>

              <button
                onClick={() => togglePublicado(estudo.id, estudo.publicado)}
                className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                  estudo.publicado
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
                title={estudo.publicado ? "Clique para inativar" : "Clique para publicar"}
              >
                {estudo.publicado ? "PUBLICADO" : "INATIVO"}
              </button>

              <button
                onClick={() => handleDelete(estudo.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <NovoEstudoModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchEstudos} />
    </>
  );
};

export default EstudosContent;
