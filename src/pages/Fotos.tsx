import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TABS = ["Sexta", "Sábado", "Domingo"];

const Fotos = () => {
  const [activeTab, setActiveTab] = useState("Sexta");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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

  const tituloCategoria = `Culto de ${activeTab}`;

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(220,20%,97%)]">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-24 pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
          <div className="container mx-auto max-w-4xl px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 italic animate-fade-in-up">
              Galeria de Fotos
            </h1>
            <p className="text-[hsl(215,20%,75%)] text-base animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              20 Anos de Ministério — Momentos especiais registrados
            </p>
          </div>
        </section>

        {/* Content */}
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
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[hsl(220,20%,92%)] bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setLightboxUrl(foto.url)}
                  >
                    <img
                      src={foto.url}
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

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightboxUrl(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxUrl}
            alt="Foto ampliada"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Fotos;
