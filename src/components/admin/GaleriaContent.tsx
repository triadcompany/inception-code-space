import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

const CATEGORIAS = ["Sexta", "Sábado", "Domingo"] as const;

const GaleriaContent = () => {
  const [activeTab, setActiveTab] = useState<string>("Sexta");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: fotos, isLoading } = useQuery({
    queryKey: ["admin_galeria_fotos", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("galeria_fotos")
        .select("*")
        .eq("categoria", activeTab)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (foto: { id: string; url: string }) => {
      // Extract file path from URL
      const urlParts = foto.url.split("/storage/v1/object/public/galeria/");
      if (urlParts.length > 1) {
        await supabase.storage.from("galeria").remove([urlParts[1]]);
      }
      const { error } = await supabase.from("galeria_fotos").delete().eq("id", foto.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_galeria_fotos", activeTab] });
      toast.success("Foto removida com sucesso!");
    },
    onError: () => toast.error("Erro ao remover foto."),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const fileList = Array.from(files);
    setUploadProgress({ current: 0, total: fileList.length });

    let successCount = 0;
    let failCount = 0;

    for (const file of fileList) {
      try {
        // Compress image before upload
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const ext = file.name.split(".").pop();
        const fileName = `${activeTab.toLowerCase()}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("galeria")
          .upload(fileName, compressed, { upsert: false });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          failCount++;
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from("galeria")
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase.from("galeria_fotos").insert({
          url: publicUrl.publicUrl,
          categoria: activeTab,
          descricao: file.name.replace(/\.[^/.]+$/, ""),
        });

        if (dbError) {
          console.error("DB insert error:", dbError);
          failCount++;
          continue;
        }

        successCount++;
      } catch (err) {
        console.error("Upload error for file:", file.name, err);
        failCount++;
      }

      setUploadProgress((prev) => ({ ...prev, current: prev.current + 1 }));
      // Yield to UI thread
      await new Promise((r) => setTimeout(r, 50));
    }

    queryClient.invalidateQueries({ queryKey: ["admin_galeria_fotos", activeTab] });

    if (successCount > 0) toast.success(`${successCount} foto(s) enviada(s) com sucesso!`);
    if (failCount > 0) toast.error(`${failCount} foto(s) falharam no envio.`);

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Galeria de Fotos</h1>
          <p className="text-[hsl(220,15%,55%)]">20 Anos de Ministério — Gerencie as fotos por dia</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading
              ? `Enviando ${uploadProgress.current}/${uploadProgress.total}...`
              : "Enviar Fotos"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[hsl(220,20%,90%)] p-1 mb-6 w-fit">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === cat
                ? "bg-[hsl(218,45%,22%)] text-white"
                : "text-[hsl(220,15%,50%)] hover:bg-[hsl(220,20%,95%)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-[hsl(220,30%,20%)] mb-4">
        Culto de {activeTab}
      </h2>

      {/* Photo grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[hsl(220,20%,93%)] animate-pulse" />
          ))}
        </div>
      ) : fotos && fotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className="group relative aspect-square rounded-xl overflow-hidden border border-[hsl(220,20%,90%)] bg-white"
            >
              <img
                src={foto.url}
                alt={foto.descricao || ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate({ id: foto.id, url: foto.url })}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
              {foto.descricao && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-white text-xs truncate">{foto.descricao}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
          <Camera className="w-10 h-10 text-[hsl(220,20%,80%)] mx-auto mb-3" />
          <p className="text-[hsl(220,15%,55%)]">Nenhuma foto para {activeTab} ainda.</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="mt-4 border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Enviar primeira foto
          </Button>
        </div>
      )}
    </>
  );
};

export default GaleriaContent;
