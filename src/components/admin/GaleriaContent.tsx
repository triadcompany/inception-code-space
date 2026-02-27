import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Loader2, Camera, CheckSquare, Square, X } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

const CATEGORIAS = ["Sexta", "Sábado", "Domingo"] as const;
const FILE_STEP_TIMEOUT_MS = 45000;

const toStorageFolder = (categoria: string) =>
  categoria
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withTimeout<T>(promiseLike: PromiseLike<T>, timeoutMs: number, stepLabel: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Tempo esgotado ao ${stepLabel}`)), timeoutMs),
    ),
  ]);
}

function extractStoragePath(url: string): string | null {
  try {
    const marker = "/object/public/galeria/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    // Remove query params (e.g. ?width=...)
    const path = url.substring(idx + marker.length).split("?")[0];
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

const GaleriaContent = () => {
  const [activeTab, setActiveTab] = useState<string>("Sexta");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
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

  const { data: contagens } = useQuery({
    queryKey: ["admin_galeria_contagens"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const cat of CATEGORIAS) {
        const { count, error } = await supabase
          .from("galeria_fotos")
          .select("*", { count: "exact", head: true })
          .eq("categoria", cat);
        counts[cat] = error ? 0 : (count ?? 0);
      }
      return counts;
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!fotos) return;
    if (selectedIds.size === fotos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(fotos.map((f) => f.id)));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSingle = async (foto: { id: string; url: string }) => {
    setDeleting(true);
    try {
      const path = extractStoragePath(foto.url);
      if (path) {
        const { error: storageErr } = await supabase.storage.from("galeria").remove([path]);
        if (storageErr) console.warn("Storage delete warning:", storageErr);
      }
      const { error } = await supabase.from("galeria_fotos").delete().eq("id", foto.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin_galeria_fotos", activeTab] });
      queryClient.invalidateQueries({ queryKey: ["admin_galeria_contagens"] });
      toast.success("Foto removida!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Erro ao remover foto.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0 || !fotos) return;
    setDeleting(true);

    const selectedFotos = fotos.filter((f) => selectedIds.has(f.id));
    let successCount = 0;

    for (const foto of selectedFotos) {
      try {
        const path = extractStoragePath(foto.url);
        if (path) {
          await supabase.storage.from("galeria").remove([path]);
        }
        const { error } = await supabase.from("galeria_fotos").delete().eq("id", foto.id);
        if (error) throw error;
        successCount++;
      } catch (err) {
        console.error("Delete error for:", foto.id, err);
      }
      await new Promise((r) => setTimeout(r, 50));
    }

    queryClient.invalidateQueries({ queryKey: ["admin_galeria_fotos", activeTab] });
    queryClient.invalidateQueries({ queryKey: ["admin_galeria_contagens"] });
    toast.success(`${successCount} foto(s) removida(s)!`);
    if (successCount < selectedFotos.length) {
      toast.error(`${selectedFotos.length - successCount} foto(s) falharam.`);
    }
    setSelectedIds(new Set());
    setSelectMode(false);
    setDeleting(false);
  };

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
        const compressed = await withTimeout(
          imageCompression(file, {
            maxSizeMB: 3,
            maxWidthOrHeight: 2560,
            useWebWorker: true,
            initialQuality: 0.92,
          }),
          FILE_STEP_TIMEOUT_MS,
          `comprimir ${file.name}`,
        );

        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext) {
          failCount++;
          console.error("Arquivo sem extensão válida:", file.name);
          continue;
        }

        const fileName = `${toStorageFolder(activeTab)}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadError } = await withTimeout(
          supabase.storage.from("galeria").upload(fileName, compressed, { upsert: false }),
          FILE_STEP_TIMEOUT_MS,
          `enviar ${file.name}`,
        );

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          failCount++;
          continue;
        }

        const { data: publicUrl } = supabase.storage.from("galeria").getPublicUrl(fileName);

        const { error: dbError } = await withTimeout(
          supabase.from("galeria_fotos").insert({
            url: publicUrl.publicUrl,
            categoria: activeTab,
            descricao: file.name.replace(/\.[^/.]+$/, ""),
          }),
          FILE_STEP_TIMEOUT_MS,
          `salvar no banco ${file.name}`,
        );

        if (dbError) {
          console.error("DB insert error:", dbError);
          failCount++;
          continue;
        }

        successCount++;
      } catch (err) {
        console.error("Upload error:", file.name, err);
        failCount++;
      } finally {
        setUploadProgress((prev) => ({ ...prev, current: prev.current + 1 }));
        await wait(50);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["admin_galeria_fotos", activeTab] });
    queryClient.invalidateQueries({ queryKey: ["admin_galeria_contagens"] });
    if (successCount > 0) toast.success(`${successCount} foto(s) enviada(s)!`);
    if (failCount > 0) toast.error(`${failCount} foto(s) falharam ou excederam o tempo limite.`);
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
        <div className="flex gap-2">
          {selectMode ? (
            <>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {fotos && selectedIds.size === fotos.length ? "Desmarcar Todos" : "Selecionar Todos"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0 || deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                Excluir ({selectedIds.size})
              </Button>
              <Button variant="ghost" size="sm" onClick={exitSelectMode}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {fotos && fotos.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Selecionar
                </Button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"
              >
                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {uploading ? `Enviando ${uploadProgress.current}/${uploadProgress.total}...` : "Enviar Fotos"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[hsl(220,20%,90%)] p-1 mb-6 w-fit">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveTab(cat); exitSelectMode(); }}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === cat
                ? "bg-[hsl(218,45%,22%)] text-white"
                : "text-[hsl(220,15%,50%)] hover:bg-[hsl(220,20%,95%)]"
            }`}
          >
            {cat}
            {contagens && contagens[cat] !== undefined && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === cat ? "bg-white/20" : "bg-muted"
              }`}>
                {contagens[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-[hsl(220,30%,20%)] mb-4">Culto de {activeTab}</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[hsl(220,20%,93%)] animate-pulse" />
          ))}
        </div>
      ) : fotos && fotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fotos.map((foto) => {
            const isSelected = selectedIds.has(foto.id);
            return (
              <div
                key={foto.id}
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 bg-white transition-all ${
                  isSelected ? "border-red-400 ring-2 ring-red-200" : "border-[hsl(220,20%,90%)]"
                }`}
                onClick={selectMode ? () => toggleSelect(foto.id) : undefined}
              >
                <img src={foto.url} alt={foto.descricao || ""} className="w-full h-full object-cover" />

                {selectMode && (
                  <div className="absolute top-2 left-2 z-10">
                    {isSelected ? (
                      <CheckSquare className="w-6 h-6 text-red-500 bg-white rounded" />
                    ) : (
                      <Square className="w-6 h-6 text-[hsl(220,15%,60%)] bg-white/80 rounded" />
                    )}
                  </div>
                )}

                {!selectMode && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSingle({ id: foto.id, url: foto.url })}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                )}

                {foto.descricao && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                    <p className="text-white text-xs truncate">{foto.descricao}</p>
                  </div>
                )}
              </div>
            );
          })}
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
