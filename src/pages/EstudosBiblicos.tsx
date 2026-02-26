import { useState, useEffect } from "react";
import { User, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Estudo {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  conteudo: string | null;
}

const EstudosBiblicos = () => {
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("estudos" as any)
        .select("id, titulo, autor, data, resumo, conteudo")
        .eq("publicado", true)
        .order("data", { ascending: false });
      setEstudos((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-10 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Estudos Bíblicos</h1>
          <p className="text-muted-foreground text-sm">Aprofunde seu conhecimento nas Escrituras com nossos estudos e reflexões</p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-3xl space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : estudos.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-16">Nenhum estudo encontrado.</p>
          ) : (
            estudos.map((estudo) => (
              <div
                key={estudo.id}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setExpandedId(expandedId === estudo.id ? null : estudo.id)}
              >
                <h3 className="font-semibold text-foreground text-lg">{estudo.titulo}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{estudo.autor}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(estudo.data)}</span>
                </div>
                {estudo.resumo && <p className="text-sm text-muted-foreground mt-3">{estudo.resumo}</p>}
                {expandedId === estudo.id && estudo.conteudo && (
                  <div className="mt-4 pt-4 border-t border-border text-sm text-foreground whitespace-pre-wrap">
                    {estudo.conteudo}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EstudosBiblicos;
