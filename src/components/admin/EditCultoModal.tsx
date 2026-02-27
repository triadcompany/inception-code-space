import { useState, useEffect } from "react";
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

interface Culto {
  id: string;
  titulo: string;
  data: string;
  pregador: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  descricao?: string | null;
  resumo?: string | null;
  status: string;
}

interface EditCultoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  culto: Culto;
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

const EditCultoModal = ({ open, onOpenChange, onSuccess, culto }: EditCultoModalProps) => {
  const [titulo, setTitulo] = useState(culto.titulo);
  const [data, setData] = useState(culto.data);
  const [pregador, setPregador] = useState(culto.pregador || "");
  const [videoUrl, setVideoUrl] = useState(culto.video_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(culto.thumbnail_url || "");
  const [descricao, setDescricao] = useState("");
  const [resumo, setResumo] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showCustomPregador, setShowCustomPregador] = useState(
    !!culto.pregador && !PREGADORES.includes(culto.pregador)
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchFull = async () => {
      const { data: full } = await supabase
        .from("cultos")
        .select("descricao, resumo")
        .eq("id", culto.id)
        .single();
      if (full) {
        setDescricao((full as any).descricao || "");
        setResumo((full as any).resumo || "");
      }
      setLoadingData(false);
    };
    fetchFull();
  }, [culto.id]);

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    const thumb = extractYoutubeThumbnail(url);
    if (thumb) setThumbnailUrl(thumb);
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

      const { error } = await supabase
        .from("cultos")
        .update({
          titulo: titulo.trim(),
          data,
          pregador: pregador.trim() || null,
          video_url: videoUrl.trim() || null,
          thumbnail_url: thumbnailUrl.trim() || null,
          descricao: descricao.trim() || null,
          resumo: resumo.trim() || null,
        })
        .eq("id", culto.id);

      if (error) throw new Error(error.message);

      toast({ title: "Culto atualizado com sucesso!" });
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
          <DialogTitle className="text-xl font-bold">Editar Culto</DialogTitle>
          <DialogDescription className="text-[hsl(220,15%,55%)]">
            Altere os dados do culto.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
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
                <Label className="text-[hsl(220,30%,20%)]">URL da Thumbnail</Label>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))]"
                />
              </div>
            </div>

            {thumbnailUrl && (
              <div className="rounded-lg overflow-hidden border border-[hsl(220,20%,90%)] aspect-video">
                <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Descrição</Label>
              <RichTextEditor
                content={descricao}
                onChange={setDescricao}
                placeholder="Descrição do culto..."
                minHeight="180px"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Resumo do Culto</Label>
              <RichTextEditor
                content={resumo}
                onChange={setResumo}
                placeholder="Resumo do culto..."
                minHeight="120px"
              />
            </div>

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
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditCultoModal;
