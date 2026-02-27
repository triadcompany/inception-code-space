import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, GripVertical, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AnimatedSection from "./AnimatedSection";

interface Tema {
  id: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  publicado: boolean;
  created_at: string;
}

const TemasContent = () => {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const { toast } = useToast();

  const fetchTemas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("temas" as any)
      .select("*")
      .order("ordem", { ascending: true });
    if (error) {
      toast({ title: "Erro ao carregar temas", description: error.message, variant: "destructive" });
    } else {
      setTemas((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemas(); }, []);

  const handleAdd = async () => {
    if (!novoNome.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("temas" as any).insert({
      nome: novoNome.trim(),
      descricao: novaDescricao.trim() || null,
      ordem: temas.length,
    } as any);
    if (error) {
      toast({ title: "Erro ao criar tema", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema criado!" });
      setNovoNome("");
      setNovaDescricao("");
      fetchTemas();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este tema? Os estudos vinculados ficarão sem tema.")) return;
    const { error } = await supabase.from("temas" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema excluído" });
      fetchTemas();
    }
  };

  const handleEdit = async (id: string) => {
    if (!editNome.trim()) return;
    const { error } = await supabase.from("temas" as any).update({
      nome: editNome.trim(),
      descricao: editDescricao.trim() || null,
    } as any).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tema atualizado" });
      setEditingId(null);
      fetchTemas();
    }
  };

  const togglePublicado = async (id: string, current: boolean) => {
    const { error } = await supabase.from("temas" as any).update({ publicado: !current } as any).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Tema ${!current ? "publicado" : "inativado"}` });
      fetchTemas();
    }
  };

  return (
    <>
      <AnimatedSection>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Temas de Estudos</h1>
          <p className="text-[hsl(220,15%,55%)]">Organize os estudos bíblicos em temas</p>
        </div>
      </AnimatedSection>

      {/* Add new tema */}
      <AnimatedSection delay={50}>
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-5 mb-6">
          <p className="text-sm font-semibold text-[hsl(220,30%,20%)] mb-3">Novo Tema</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Sete Selos"
              className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
            />
            <Input
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="Descrição (opcional)"
              className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
            />
            <Button
              onClick={handleAdd}
              disabled={adding || !novoNome.trim()}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* Temas list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
        </div>
      ) : temas.length === 0 ? (
        <AnimatedSection delay={100}>
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
            <p className="text-[hsl(220,15%,55%)]">Nenhum tema cadastrado ainda.</p>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection delay={100}>
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] divide-y divide-[hsl(220,20%,93%)] overflow-hidden">
            {temas.map((tema) => (
              <div key={tema.id} className="flex items-center gap-3 p-4 hover:bg-[hsl(220,20%,98%)] transition-all duration-200">
                {editingId === tema.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <Input
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)]"
                    />
                    <Input
                      value={editDescricao}
                      onChange={(e) => setEditDescricao(e.target.value)}
                      placeholder="Descrição"
                      className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)]"
                    />
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(tema.id)} className="p-2 rounded-lg hover:bg-green-50 text-green-600"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[hsl(220,30%,20%)]">{tema.nome}</p>
                      {tema.descricao && <p className="text-xs text-[hsl(220,15%,65%)] mt-0.5">{tema.descricao}</p>}
                    </div>

                    <button
                      onClick={() => togglePublicado(tema.id, tema.publicado)}
                      className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-all duration-200 hover:shadow-sm active:scale-95 ${
                        tema.publicado ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                    >
                      {tema.publicado ? "PUBLICADO" : "INATIVO"}
                    </button>

                    <button
                      onClick={() => { setEditingId(tema.id); setEditNome(tema.nome); setEditDescricao(tema.descricao || ""); }}
                      className="p-2 rounded-lg hover:bg-[hsl(220,20%,93%)] text-[hsl(220,15%,55%)] hover:text-[hsl(var(--primary))]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button onClick={() => handleDelete(tema.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>
      )}
    </>
  );
};

export default TemasContent;
