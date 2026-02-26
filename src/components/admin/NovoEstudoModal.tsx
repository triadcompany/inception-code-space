import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setTitulo("");
    setAutor("");
    setData("");
    setResumo("");
    setConteudo("");
    setPublicado(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !autor.trim() || !data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("estudos" as any)
        .insert({
          titulo: titulo.trim(),
          autor: autor.trim(),
          data,
          resumo: resumo.trim() || null,
          conteudo: conteudo.trim() || null,
          publicado,
        } as any);

      if (error) throw new Error(error.message);

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

          {/* Resumo */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Resumo</Label>
            <Textarea
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="Breve descrição do estudo..."
              rows={3}
              className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))] resize-none"
            />
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Conteúdo</Label>
            <Textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva o conteúdo do estudo aqui..."
              rows={10}
              className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))] resize-y"
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
