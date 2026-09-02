import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDoutrina, deleteDoutrina, listDoutrinas, listEstudos, updateDoutrina } from "@/lib/resources";
import NovaDoutrinaModal from "./NovaDoutrinaModal";
import EditDoutrinaModal from "./EditDoutrinaModal";
import { useToast } from "@/hooks/use-toast";
import AnimatedSection from "./AnimatedSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

interface Estudo {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  conteudo: string | null;
}

const DoutrinasContent = () => {
  const [doutrinas, setDoutrinas] = useState<Doutrina[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doutrina | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [estudosLoading, setEstudosLoading] = useState(false);
  const [importSearch, setImportSearch] = useState("");
  const [importing, setImporting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDoutrinas = async () => {
    setLoading(true);
    const { data, error } = await listDoutrinas({ order: "data", dir: "desc" });

    if (error) {
      toast({ title: "Erro ao carregar doutrinas", description: error.message, variant: "destructive" });
    } else {
      setDoutrinas((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDoutrinas(); }, []);

  const fetchEstudos = async () => {
    setEstudosLoading(true);
    const { data } = await listEstudos({ order: "data", dir: "desc" });
    setEstudos((data as any) || []);
    setEstudosLoading(false);
  };

  const handleOpenImport = () => {
    setImportOpen(true);
    setImportSearch("");
    fetchEstudos();
  };

  const handleImportEstudo = async (estudo: Estudo) => {
    setImporting(estudo.id);
    try {
      const { error } = await createDoutrina({
        titulo: estudo.titulo,
        autor: estudo.autor,
        data: estudo.data,
        resumo: estudo.resumo,
        conteudo: estudo.conteudo,
        publicado: true,
      });

      if (error) throw new Error(error.message);
      toast({ title: `"${estudo.titulo}" importado com sucesso!` });
      fetchDoutrinas();
    } catch (err: any) {
      toast({ title: "Erro ao importar", description: err.message, variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  const filteredEstudos = estudos.filter((e) =>
    e.titulo.toLowerCase().includes(importSearch.toLowerCase()) ||
    e.autor.toLowerCase().includes(importSearch.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const { error } = await deleteDoutrina(id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Doutrina excluída" });
      fetchDoutrinas();
    }
  };

  const togglePublicado = async (id: string, current: boolean) => {
    const { error } = await updateDoutrina(id, { publicado: !current });
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(220,30%,20%)]">Doutrina</h1>
            <p className="text-[hsl(220,15%,55%)]">Gerencie os estudos doutrinários</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button onClick={handleOpenImport} variant="outline" className="border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] hover:shadow-sm active:scale-[0.97] transition-all duration-200">
              <Download className="h-4 w-4 mr-2" /> Importar Estudo
            </Button>
            <Button onClick={() => setModalOpen(true)} className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white hover:shadow-md active:scale-[0.97] transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" /> Criar do Zero
            </Button>
          </div>
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
            <div className="flex justify-center gap-3 mt-4">
              <Button onClick={handleOpenImport} variant="outline" className="border-[hsl(var(--primary))] text-[hsl(var(--primary))]">
                <Download className="h-4 w-4 mr-2" /> Importar Estudo
              </Button>
              <Button onClick={() => setModalOpen(true)} className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white">
                <Plus className="h-4 w-4 mr-2" /> Criar do Zero
              </Button>
            </div>
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

      {/* Import from Estudos Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col bg-white text-[hsl(220,30%,20%)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Importar Estudo Bíblico</DialogTitle>
            <DialogDescription className="text-[hsl(220,15%,55%)]">
              Selecione um estudo bíblico para importar como doutrina.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mb-3">
            <Input
              placeholder="Buscar por título ou autor..."
              value={importSearch}
              onChange={(e) => setImportSearch(e.target.value)}
              className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {estudosLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(var(--primary))]" />
              </div>
            ) : filteredEstudos.length === 0 ? (
              <p className="text-center text-[hsl(220,15%,55%)] py-8 text-sm">
                {importSearch ? "Nenhum estudo encontrado." : "Nenhum estudo bíblico disponível."}
              </p>
            ) : (
              filteredEstudos.map((estudo) => (
                <div
                  key={estudo.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(220,20%,92%)] hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(220,20%,98%)] transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[hsl(220,30%,20%)] truncate">{estudo.titulo}</p>
                    <p className="text-xs text-[hsl(220,15%,55%)]">{formatDate(estudo.data)} • {estudo.autor}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleImportEstudo(estudo)}
                    disabled={importing === estudo.id}
                    className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white text-xs shrink-0"
                  >
                    {importing === estudo.id ? "Importando..." : "Importar"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <NovaDoutrinaModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchDoutrinas} />
      <EditDoutrinaModal doutrina={editing} open={!!editing} onOpenChange={(v) => { if (!v) setEditing(null); }} onSuccess={fetchDoutrinas} />
    </>
  );
};

export default DoutrinasContent;
