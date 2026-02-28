import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TABS = ["Sexta", "Sábado", "Domingo"];

// Convert public URL to Supabase transform URL for optimized loading
const getOptimizedUrl = (url: string, width: number, quality = 80) => {
  // Only transform Supabase storage URLs
  if (!url.includes("/storage/v1/object/public/")) return url;
  return url.replace(
    "/storage/v1/object/public/",
    `/storage/v1/render/image/public/`
  ) + `?width=${width}&quality=${quality}&resize=contain`;
};

const Fotos = () => {
  const [activeTab, setActiveTab] = useState("Sexta");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: fotos, isLoading } = useQuery({
    queryKey: ["galeria_fotos", activeTab],
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

  const goNext = useCallback(() => {
    if (!fotos || lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % fotos.length);
  }, [fotos, lightboxIndex]);

  const goPrev = useCallback(() => {
    if (!fotos || lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + fotos.length) % fotos.length);
  }, [fotos, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, goNext, goPrev]);

  const tituloCategoria = `Culto de ${activeTab}`;
  const currentFoto = fotos && lightboxIndex !== null ? fotos[lightboxIndex] : null;

  // Preload adjacent images when lightbox is open
  useEffect(() => {
    if (!fotos || lightboxIndex === null || fotos.length <= 1) return;
    const preloadIndexes = [
      (lightboxIndex + 1) % fotos.length,
      (lightboxIndex - 1 + fotos.length) % fotos.length,
    ];
    preloadIndexes.forEach((i) => {
      const img = new Image();
      img.src = getOptimizedUrl(fotos[i].url, 1280, 80);
    });
  }, [fotos, lightboxIndex]);

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(220,20%,97%)]">
      <Navbar />
      <main className="flex-1">
        <section className="relative pt-24 pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
          <div className="container mx-auto max-w-4xl px-4 relative z-10 text-center">
            <Link to="/sobre/20-anos" className="inline-flex items-center gap-2 text-sm text-[hsl(215,20%,70%)] hover:text-white transition-colors mb-4 sm:mb-6">
              <ArrowLeft className="w-4 h-4" /> 20 Anos de Ministério
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 animate-fade-in-up">
              Galeria de Fotos
            </h1>
            <p className="text-[hsl(215,20%,75%)] text-base animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              20 Anos de Ministério — Momentos especiais registrados
            </p>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--primary))]">Celebração</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[hsl(220,30%,20%)] mt-2">Nossos Momentos</h2>
            </div>

            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-white rounded-xl border border-[hsl(220,20%,90%)] p-1 shadow-sm">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-[hsl(220,20%,95%)] text-[hsl(220,30%,20%)] shadow-sm"
                        : "text-[hsl(220,15%,50%)] hover:text-[hsl(220,30%,20%)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="text-xl font-display font-bold text-[hsl(220,30%,20%)] mb-6">{tituloCategoria}</h3>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-white animate-pulse" />
                ))}
              </div>
            ) : fotos && fotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fotos.map((foto, index) => (
                  <div
                    key={foto.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[hsl(220,20%,92%)] bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={getOptimizedUrl(foto.url, 640, 75)}
                      alt={foto.descricao || "Foto da galeria"}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {foto.descricao && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm">{foto.descricao}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[hsl(220,20%,92%)]">
                <p className="text-[hsl(220,15%,50%)]">Nenhuma foto disponível ainda.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Lightbox with navigation */}
      {currentFoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-7 h-7" />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex! + 1} / {fotos!.length}
          </div>

          {/* Prev */}
          {fotos!.length > 1 && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* Image */}
          <img
            key={currentFoto.id}
            src={getOptimizedUrl(currentFoto.url, 1280, 80)}
            alt={currentFoto.descricao || "Foto ampliada"}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {fotos!.length > 1 && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* Description */}
          {currentFoto.descricao && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-4 py-2 rounded-lg">
              {currentFoto.descricao}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Fotos;
