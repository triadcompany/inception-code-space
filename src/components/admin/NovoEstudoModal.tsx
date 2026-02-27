import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "./RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tema { id: string; nome: string; parent_id: string | null; }

interface NovoEstudoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const NovoEstudoModal = ({ open, onOpenChange, onSuccess }: NovoEstudoModalProps) => {
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
    if (open) {
      supabase.from("temas" as any).select("id, nome, parent_id").order("ordem").then(({ data }) => {
        setTemas((data as any) || []);
      });
    }
  }, [open]);

  const resetForm = () => {
    setTitulo("");
    setAutor("");
    setData("");
    setResumo("");
    setConteudo("");
    setPublicado(true);
    setTemaId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !autor.trim() || !data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast({ title: "Sessão expirada. Faça login novamente.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data: result, error } = await supabase
        .from("estudos" as any)
        .insert({
          titulo: titulo.trim(),
          autor: autor.trim(),
          data,
          resumo: resumo.trim() || null,
          conteudo: conteudo.trim() || null,
          publicado,
          tema_id: temaId && temaId !== "none" ? temaId : null,
          created_by: user.id,
        } as any)
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      if (!result) {
        throw new Error("Não foi possível salvar. Verifique suas permissões.");
      }

      toast({ title: "Estudo adicionado com sucesso!" });
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Save error:", error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-[hsl(220,30%,20%)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Novo Estudo</DialogTitle>
          <DialogDescription className="text-[hsl(220,15%,55%)]">
            Preencha os dados para adicionar um novo estudo bíblico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Título */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Título *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do estudo"
              className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
              required
            />
          </div>

          {/* Autor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Autor *</Label>
              <Input
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Nome do autor"
                className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Data *</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
                required
              />
            </div>
          </div>

          {/* Tema */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Tema</Label>
            <Select value={temaId} onValueChange={setTemaId}>
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

          {/* Resumo */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Resumo</Label>
            <RichTextEditor
              content={resumo}
              onChange={setResumo}
              placeholder="Breve descrição do estudo..."
              minHeight="120px"
            />
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Conteúdo</Label>
            <RichTextEditor
              content={conteudo}
              onChange={setConteudo}
              placeholder="Escreva o conteúdo do estudo aqui..."
              minHeight="220px"
            />
          </div>

          {/* Publicado */}
          <div className="flex items-center gap-3">
            <Switch checked={publicado} onCheckedChange={setPublicado} />
            <Label className="text-[hsl(220,30%,20%)]">Publicado</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[hsl(220,20%,85%)] text-[hsl(220,30%,20%)] bg-white hover:bg-[hsl(220,20%,93%)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"
            >
              {loading ? "Salvando..." : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoEstudoModal;
