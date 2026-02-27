import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RichTextEditor from "./RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PREGADORES = [
  "Pr. Rafael Delmonego",
  "Ir. Rosimar Fiamoncini",
  "Ir. Renne Costa",
  "Ir. Juliano da Rocha",
  "Ir. Joglair Gregolin",
];

interface NovoCultoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const extractYoutubeThumbnail = (url: string): string => {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return "";
};

const NovoCultoModal = ({ open, onOpenChange, onSuccess }: NovoCultoModalProps) => {
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [pregador, setPregador] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [descricao, setDescricao] = useState("");
  const [resumo, setResumo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCustomPregador, setShowCustomPregador] = useState(false);
  const { toast } = useToast();

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    const thumb = extractYoutubeThumbnail(url);
    if (thumb) setThumbnailUrl(thumb);
  };

  const resetForm = () => {
    setTitulo("");
    setData("");
    setPregador("");
    setVideoUrl("");
    setThumbnailUrl("");
    setDescricao("");
    setResumo("");
    setShowCustomPregador(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !data) {
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
        .from("cultos")
        .insert({
          titulo: titulo.trim(),
          data,
          pregador: pregador.trim() || null,
          video_url: videoUrl.trim() || null,
          thumbnail_url: thumbnailUrl.trim() || null,
          descricao: descricao.trim() || null,
          resumo: resumo.trim() || null,
          status: "publicado",
          created_by: user.id,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message || "Erro ao salvar culto");
      }

      if (!result) {
        throw new Error("Não foi possível salvar. Verifique suas permissões.");
      }

      toast({ title: "Culto adicionado com sucesso!" });
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
          <DialogTitle className="text-xl font-bold">Novo Culto</DialogTitle>
          <DialogDescription className="text-[hsl(220,15%,55%)]">
            Preencha os dados para adicionar um novo culto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Título e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Título *</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título do culto"
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

          {/* Pregador */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Pregador</Label>
            <Select
              value={PREGADORES.includes(pregador) ? pregador : pregador ? "__other__" : ""}
              onValueChange={(val) => {
                if (val === "__other__") {
                  setPregador("");
                  setShowCustomPregador(true);
                } else {
                  setPregador(val);
                  setShowCustomPregador(false);
                }
              }}
            >
              <SelectTrigger className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)]">
                <SelectValue placeholder="Selecione o pregador" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[hsl(220,20%,90%)]">
                {PREGADORES.map((p) => (
                  <SelectItem key={p} value={p} className="text-[hsl(220,30%,20%)] focus:bg-[hsl(220,20%,93%)] focus:text-[hsl(220,30%,20%)]">{p}</SelectItem>
                ))}
                <SelectItem value="__other__" className="text-[hsl(220,30%,20%)] focus:bg-[hsl(220,20%,93%)] focus:text-[hsl(220,30%,20%)]">Outro...</SelectItem>
              </SelectContent>
            </Select>
            {showCustomPregador && (
              <Input
                value={pregador}
                onChange={(e) => setPregador(e.target.value)}
                placeholder="Digite o nome do pregador"
                className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))] mt-2"
                autoFocus
              />
            )}
          </div>

          {/* Video URL e Thumbnail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Link do Vídeo (YouTube)</Label>
              <Input
                value={videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">URL da Thumbnail (auto-preenchida)</Label>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
              />
            </div>
          </div>

          {/* Thumbnail Preview */}
          {thumbnailUrl && (
            <div className="rounded-lg overflow-hidden border border-[hsl(220,20%,90%)] aspect-video">
              <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Descrição</Label>
            <RichTextEditor
              content={descricao}
              onChange={setDescricao}
              placeholder="Descrição do culto..."
              minHeight="180px"
            />
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <Label className="text-[hsl(220,30%,20%)]">Resumo do Culto</Label>
            <RichTextEditor
              content={resumo}
              onChange={setResumo}
              placeholder="Resumo do culto..."
              minHeight="120px"
            />
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
              {loading ? "Salvando..." : "Salvar Culto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoCultoModal;
