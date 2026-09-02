import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteEstudo, listEstudos, listTemas, updateEstudo } from "@/lib/resources";
import NovoEstudoModal from "./NovoEstudoModal";
import EditEstudoModal from "./EditEstudoModal";
import TemasContent from "./TemasContent";
import { useToast } from "@/hooks/use-toast";
import AnimatedSection from "./AnimatedSection";

interface Tema { id: string; nome: string; parent_id: string | null; }

interface Estudo {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  conteudo?: string | null;
  publicado: boolean;
  tema_id?: string | null;
  created_at: string;
}

const EstudosContent = () => {
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEstudo, setEditingEstudo] = useState<Estudo | null>(null);
  const [temas, setTemas] = useState<Tema[]>([]);
  const { toast } = useToast();

  const fetchEstudos = async () => {
    setLoading(true);
    const { data, error } = await listEstudos({ order: "data", dir: "desc" });

    if (error) {
      toast({ title: "Erro ao carregar estudos", description: error.message, variant: "destructive" });
    } else {
      setEstudos((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEstudos();
    listTemas().then(({ data }) => setTemas((data as any) || []));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este estudo?")) return;
    const { error } = await deleteEstudo(id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Estudo excluído" });
      fetchEstudos();
    }
  };

  const togglePublicado = async (id: string, current: boolean) => {
    const { error } = await updateEstudo(id, { publicado: !current });
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
      <AnimatedSection>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(220,30%,20%)]">Estudos Bíblicos</h1>
          <p className="text-[hsl(220,15%,55%)]">Gerencie os estudos bíblicos e seus temas</p>
        </div>
      </AnimatedSection>

      <Tabs defaultValue="estudos" className="w-full">
        <TabsList className="mb-6 bg-[hsl(220,20%,93%)]">
          <TabsTrigger value="estudos" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(220,30%,20%)] text-[hsl(220,15%,55%)]">
            Estudos
          </TabsTrigger>
          <TabsTrigger value="temas" className="data-[state=active]:bg-white data-[state=active]:text-[hsl(220,30%,20%)] text-[hsl(220,15%,55%)]">
            <Tag className="h-3.5 w-3.5 mr-1.5" />
            Temas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estudos">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white hover:shadow-md active:scale-[0.97] transition-all duration-200"
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
            <AnimatedSection delay={100}>
              <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
                <p className="text-[hsl(220,15%,55%)]">Nenhum item cadastrado ainda.</p>
                <Button
                  onClick={() => setModalOpen(true)}
                  variant="outline"
                  className="mt-4 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:shadow-sm active:scale-[0.97] transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Estudo
                </Button>
              </div>
            </AnimatedSection>
          ) : (
            <AnimatedSection delay={100}>
              <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] divide-y divide-[hsl(220,20%,93%)] overflow-hidden">
                {estudos.map((estudo) => (
                  <div
                    key={estudo.id}
                    className="flex items-center gap-4 p-4 hover:bg-[hsl(220,20%,98%)] transition-all duration-200 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[hsl(220,30%,20%)] truncate">{estudo.titulo}</p>
                      <p className="text-xs text-[hsl(220,15%,55%)]">
                        {formatDate(estudo.data)} • {estudo.autor}
                        {estudo.tema_id && (() => {
                          const tema = temas.find(t => t.id === estudo.tema_id);
                          if (!tema) return null;
                          const parent = tema.parent_id ? temas.find(t => t.id === tema.parent_id) : null;
                          const label = parent ? `${parent.nome} › ${tema.nome}` : tema.nome;
                          return (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-medium">
                              {label}
                            </span>
                          );
                        })()}
                      </p>
                      {estudo.resumo && (
                        <p className="text-xs text-[hsl(220,15%,65%)] mt-1 truncate">{estudo.resumo}</p>
                      )}
                    </div>

                    <button
                      onClick={() => togglePublicado(estudo.id, estudo.publicado)}
                      className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-all duration-200 hover:shadow-sm active:scale-95 ${
                        estudo.publicado
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                      title={estudo.publicado ? "Clique para inativar" : "Clique para publicar"}
                    >
                      {estudo.publicado ? "PUBLICADO" : "INATIVO"}
                    </button>

                    <button
                      onClick={() => setEditingEstudo(estudo)}
                      className="p-2 rounded-lg hover:bg-[hsl(220,20%,93%)] text-[hsl(220,15%,55%)] hover:text-[hsl(var(--primary))] active:scale-90 transition-all duration-200"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(estudo.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 active:scale-90 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          )}
        </TabsContent>

        <TabsContent value="temas">
          <TemasContent />
        </TabsContent>
      </Tabs>

      <NovoEstudoModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchEstudos} />
      <EditEstudoModal estudo={editingEstudo} open={!!editingEstudo} onOpenChange={(v) => { if (!v) setEditingEstudo(null); }} onSuccess={fetchEstudos} />
    </>
  );
};

export default EstudosContent;
