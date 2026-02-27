import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RichTextEditor from "./RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Doutrina {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  conteudo?: string | null;
  publicado: boolean;
}

interface Props {
  doutrina: Doutrina | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditDoutrinaModal = ({ doutrina, open, onOpenChange, onSuccess }: Props) => {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [data, setData] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [publicado, setPublicado] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (doutrina) {
      setTitulo(doutrina.titulo);
      setAutor(doutrina.autor);
      setData(doutrina.data);
      setResumo(doutrina.resumo || "");
      setConteudo(doutrina.conteudo || "");
      setPublicado(doutrina.publicado);
    }
  }, [doutrina]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doutrina || !titulo.trim() || !autor.trim() || !data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("doutrinas" as any)
        .update({ titulo: titulo.trim(), autor: autor.trim(), data, resumo: resumo.trim() || null, conteudo: conteudo.trim() || null, publicado } as any)
        .eq("id", doutrina.id);

      if (error) throw new Error(error.message);
      toast({ title: "Doutrina atualizada com sucesso!" });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-[hsl(220,30%,20%)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Doutrina</DialogTitle>
          <DialogDescription className="text-[hsl(220,15%,55%)]">Altere os dados do estudo doutrinário.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]" required />
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
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Resumo</Label>
            <RichTextEditor content={resumo} onChange={setResumo} placeholder="Breve descrição..." minHeight="120px" />
          </div>
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Conteúdo</Label>
            <RichTextEditor content={conteudo} onChange={setConteudo} placeholder="Escreva o conteúdo aqui..." minHeight="220px" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={publicado} onCheckedChange={setPublicado} />
            <Label className="text-[hsl(220,30%,20%)]">Publicado</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[hsl(220,20%,85%)] text-[hsl(220,30%,20%)] bg-white hover:bg-[hsl(220,20%,93%)]">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white">{loading ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDoutrinaModal;
