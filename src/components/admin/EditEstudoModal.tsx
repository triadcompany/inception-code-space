import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "./RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { listTemas, updateEstudo } from "@/lib/resources";
import { useToast } from "@/hooks/use-toast";

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
}

interface EditEstudoModalProps {
  estudo: Estudo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditEstudoModal = ({ estudo, open, onOpenChange, onSuccess }: EditEstudoModalProps) => {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [data, setData] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [publicado, setPublicado] = useState(true);
  const [temaId, setTemaId] = useState<string>("");
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (estudo) {
      setTitulo(estudo.titulo);
      setAutor(estudo.autor);
      setData(estudo.data);
      setResumo(estudo.resumo || "");
      setConteudo(estudo.conteudo || "");
      setPublicado(estudo.publicado);
      setTemaId(estudo.tema_id || "");
    }
  }, [estudo]);

  useEffect(() => {
    if (open) {
      listTemas().then(({ data }) => setTemas((data as any) || []));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudo || !titulo.trim() || !autor.trim() || !data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateEstudo(estudo.id, {
        titulo: titulo.trim(),
        autor: autor.trim(),
        data,
        resumo: resumo.trim() || null,
        conteudo: conteudo.trim() || null,
        publicado,
        tema_id: temaId && temaId !== "none" ? temaId : null,
      });

      if (error) throw new Error(error.message);

      toast({ title: "Estudo atualizado com sucesso!" });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Update error:", error);
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-[hsl(220,30%,20%)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Estudo</DialogTitle>
          <DialogDescription className="text-[hsl(220,15%,55%)]">
            Altere os dados do estudo bíblico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do estudo" className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Autor *</Label>
              <Input value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="Nome do autor" className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Data *</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]" required />
            </div>
          </div>

          {/* Tema */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Tema</Label>
            <Select value={temaId || "none"} onValueChange={setTemaId}>
              <SelectTrigger className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)]">
                <SelectValue placeholder="Sem tema (avulso)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem tema (avulso)</SelectItem>
                {temas.filter(t => !t.parent_id).map((parent) => (
                  <>
                    <SelectItem key={parent.id} value={parent.id}>{parent.nome}</SelectItem>
                    {temas.filter(t => t.parent_id === parent.id).map((child) => (
                      <SelectItem key={child.id} value={child.id}>↳ {child.nome}</SelectItem>
                    ))}
                  </>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Resumo</Label>
            <RichTextEditor content={resumo} onChange={setResumo} placeholder="Breve descrição do estudo..." minHeight="120px" />
          </div>

          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Conteúdo</Label>
            <RichTextEditor content={conteudo} onChange={setConteudo} placeholder="Escreva o conteúdo do estudo aqui..." minHeight="220px" />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={publicado} onCheckedChange={setPublicado} />
            <Label className="text-[hsl(220,30%,20%)]">Publicado</Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[hsl(220,20%,85%)] text-[hsl(220,30%,20%)] bg-white hover:bg-[hsl(220,20%,93%)]">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEstudoModal;
