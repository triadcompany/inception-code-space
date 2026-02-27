import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Fotos = () => {
  const { data: fotos, isLoading } = useQuery({
    queryKey: ["galeria_fotos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("galeria_fotos")
        .select("*")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-72 h-72 bg-[hsl(var(--primary))] rounded-full blur-[120px]" />
          </div>
          <div className="container mx-auto max-w-3xl px-4 relative z-10">
            <Link to="/sobre/20-anos" className="inline-flex items-center gap-2 text-sm text-[hsl(215,20%,70%)] hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)] rounded-full px-3 py-1 mb-4">
              <Camera className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              <span className="text-xs font-medium text-[hsl(var(--primary))]">Galeria</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight animate-fade-in-up">
              Fotos
            </h1>
            <p className="text-[hsl(215,20%,75%)] text-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Registros dos momentos marcantes ao longo de 20 anos de ministério
            </p>
          </div>
        </section>

        {/* Gallery */}
        <section className="px-4 py-16">
          <div className="container mx-auto max-w-5xl">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-[hsl(220,20%,95%)] animate-pulse" />
                ))}
              </div>
            ) : fotos && fotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-[hsl(220,20%,92%)] hover:shadow-lg transition-all duration-300"
                  >
                    <img
                      src={foto.url}
                      alt={foto.descricao || "Foto da galeria"}
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
              <div className="text-center py-20">
                <Camera className="w-12 h-12 text-[hsl(220,20%,80%)] mx-auto mb-4" />
                <p className="text-[hsl(220,15%,50%)] text-lg">Em breve novas fotos serão adicionadas.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Fotos;
