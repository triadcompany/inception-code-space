import { Link } from "react-router-dom";
import { ArrowLeft, Star, Play, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CultosEspeciais = () => {
  const { data: cultos, isLoading } = useQuery({
    queryKey: ["cultos_especiais_20anos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cultos")
        .select("*")
        .eq("status", "publicado")
        .ilike("titulo", "%20 anos%")
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-20 sm:pt-24 pb-10 sm:pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-72 h-72 bg-[hsl(var(--primary))] rounded-full blur-[120px]" />
          </div>
          <div className="container mx-auto max-w-3xl px-4 relative z-10">
            <Link to="/sobre/20-anos" className="inline-flex items-center gap-2 text-sm text-[hsl(215,20%,70%)] hover:text-white transition-colors mb-4 sm:mb-6">
              <ArrowLeft className="w-4 h-4" /> 20 Anos de Ministério
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-3 sm:mb-4 leading-tight animate-fade-in-up">
              Cultos Especiais
            </h1>
            <p className="text-[hsl(215,20%,75%)] text-base sm:text-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              20 Anos de Ministério — Momentos marcantes de adoração e louvor
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 py-10 sm:py-16">
          <div className="container mx-auto max-w-4xl">
            {isLoading ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-[hsl(220,20%,96%)] animate-pulse h-52 sm:h-64" />
                ))}
              </div>
            ) : cultos && cultos.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                {cultos.map((culto) => (
                  <Link
                    key={culto.id}
                    to={`/cultos/${culto.id}`}
                    className="group rounded-2xl border border-[hsl(220,20%,92%)] overflow-hidden hover:border-[hsl(var(--primary)/0.3)] hover:shadow-lg transition-all duration-300"
                  >
                    {culto.thumbnail_url ? (
                      <div className="aspect-video relative overflow-hidden bg-[hsl(220,20%,96%)]">
                        <img
                          src={culto.thumbnail_url}
                          alt={culto.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-[hsl(218,48%,14%)] to-[hsl(218,40%,24%)] flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-[hsl(220,15%,55%)] mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(culto.data + "T12:00:00"), "d 'de' MMMM, yyyy", { locale: ptBR })}
                        {culto.pregador && (
                          <span className="ml-auto text-[hsl(var(--primary))] font-medium">{culto.pregador}</span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-[hsl(220,30%,20%)] group-hover:text-[hsl(var(--primary))] transition-colors">
                        {culto.titulo}
                      </h3>
                      {culto.resumo && (
                        <p className="text-sm text-[hsl(220,15%,50%)] mt-2 line-clamp-2">{culto.resumo}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Star className="w-12 h-12 text-[hsl(220,20%,80%)] mx-auto mb-4" />
                <h2 className="text-xl font-display font-semibold text-[hsl(220,30%,20%)] mb-2">Em breve</h2>
                <p className="text-[hsl(220,15%,55%)]">
                  Os cultos especiais dos 20 anos serão publicados aqui em breve.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CultosEspeciais;
