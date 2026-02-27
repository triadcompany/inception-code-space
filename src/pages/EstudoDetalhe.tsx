import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Share2, BookOpen, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Estudo {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  conteudo: string | null;
  tema_id: string | null;
}

interface Tema {
  id: string;
  nome: string;
  parent_id: string | null;
}

const EstudoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const [estudo, setEstudo] = useState<Estudo | null>(null);
  const [loading, setLoading] = useState(true);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [relacionados, setRelacionados] = useState<Estudo[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const [estudoRes, temasRes] = await Promise.all([
        supabase
          .from("estudos" as any)
          .select("id, titulo, autor, data, resumo, conteudo, tema_id")
          .eq("id", id)
          .eq("publicado", true)
          .single(),
        supabase.from("temas" as any).select("id, nome, parent_id").order("ordem"),
      ]);
      const estudoData = estudoRes.data as any;
      setEstudo(estudoData);
      setTemas((temasRes.data as any) || []);

      // Fetch related estudos from same tema
      if (estudoData?.tema_id) {
        const { data: rel } = await supabase
          .from("estudos" as any)
          .select("id, titulo, autor, data, resumo, conteudo, tema_id")
          .eq("publicado", true)
          .eq("tema_id", estudoData.tema_id)
          .neq("id", id)
          .order("data", { ascending: false })
          .limit(6);
        setRelacionados((rel as any) || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const handleShare = async () => {
    try {
      await navigator.share({ title: estudo?.titulo, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!" });
    }
  };

  const readingTime = estudo?.conteudo
    ? Math.max(1, Math.ceil(estudo.conteudo.split(/\s+/).length / 200))
    : null;

  const tema = estudo?.tema_id ? temas.find((t) => t.id === estudo.tema_id) : null;
  const parentTema = tema?.parent_id ? temas.find((t) => t.id === tema.parent_id) : null;
  const temaLabel = tema ? (parentTema ? `${parentTema.nome} › ${tema.nome}` : tema.nome) : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Hero banner */}
        <section className="relative pt-24 pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-72 h-72 bg-[hsl(var(--primary))] rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto max-w-3xl px-4 relative z-10">
            <Link
              to="/estudos"
              className="inline-flex items-center gap-2 text-sm text-[hsl(215,20%,70%)] hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar aos Estudos
            </Link>

            {loading ? (
              <div className="h-20" />
            ) : estudo ? (
              <div className="animate-fade-in-up">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)] rounded-full px-3 py-1">
                    <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                    <span className="text-xs font-medium text-[hsl(var(--primary))]">Estudo Bíblico</span>
                  </div>
                  {temaLabel && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[hsl(38,90%,85%)] text-[hsl(38,80%,30%)] text-xs font-semibold">
                      {temaLabel}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 leading-tight">
                  {estudo.titulo}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="flex items-center gap-2 text-sm text-[hsl(215,20%,75%)]">
                    <User className="w-4 h-4 text-[hsl(var(--primary))]" />
                    {estudo.autor}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-[hsl(215,20%,75%)]">
                    <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
                    {formatDate(estudo.data)}
                  </span>
                  {readingTime && (
                    <span className="flex items-center gap-2 text-sm text-[hsl(215,20%,75%)]">
                      <Clock className="w-4 h-4 text-[hsl(var(--primary))]" />
                      {readingTime} min de leitura
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Content */}
        <section className="px-4 py-12">
          <div className="container mx-auto max-w-3xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--primary)/0.2)]" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[hsl(var(--primary))] animate-spin" />
                </div>
                <p className="text-sm text-[hsl(220,15%,55%)]">Carregando estudo...</p>
              </div>
            ) : !estudo ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-[hsl(220,20%,85%)] mx-auto mb-4" />
                <p className="text-[hsl(220,15%,45%)] font-medium text-lg">Estudo não encontrado.</p>
                <Link to="/estudos" className="text-[hsl(var(--primary))] text-sm mt-2 inline-block hover:underline">
                  Voltar aos estudos
                </Link>
              </div>
            ) : (
              <article className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                {/* Summary card */}
                {estudo.resumo && (
                  <div className="bg-[hsl(var(--primary)/0.06)] border-l-4 border-[hsl(var(--primary))] rounded-r-xl p-5 mb-8">
                    <div
                      className="prose prose-sm max-w-none text-[hsl(220,20%,35%)] leading-relaxed italic prose-p:my-1"
                      dangerouslySetInnerHTML={{ __html: estudo.resumo }}
                    />
                  </div>
                )}

                {/* Main content */}
                {estudo.conteudo && (
                  <div
                    className="prose prose-lg max-w-none text-[hsl(220,20%,25%)] leading-[1.85] prose-headings:font-display prose-headings:text-[hsl(220,30%,20%)] prose-a:text-[hsl(var(--primary))] prose-strong:text-[hsl(220,30%,20%)]"
                    dangerouslySetInnerHTML={{ __html: estudo.conteudo }}
                  />
                )}

                {/* Bottom actions */}
                <div className="mt-12 pt-8 border-t border-[hsl(220,20%,92%)] flex items-center justify-between">
                  <Link
                    to="/estudos"
                    className="inline-flex items-center gap-2 text-sm text-[hsl(220,15%,50%)] hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar aos Estudos
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                  </Button>
                </div>

                {/* Related estudos from same tema */}
                {relacionados.length > 0 && tema && (
                  <div className="mt-12 pt-8 border-t border-[hsl(220,20%,92%)]">
                    <h3 className="text-lg font-display font-bold text-[hsl(220,30%,20%)] mb-4">
                      Outros estudos de <span className="text-[hsl(var(--primary))]">{tema.nome}</span>
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {relacionados.map((rel) => (
                        <Link
                          key={rel.id}
                          to={`/estudos/${rel.id}`}
                          className="group flex items-center gap-3 p-4 bg-[hsl(220,20%,97%)] rounded-xl hover:bg-[hsl(220,20%,95%)] border border-transparent hover:border-[hsl(var(--primary)/0.2)] transition-all duration-200"
                        >
                          <BookOpen className="w-5 h-5 text-[hsl(var(--primary)/0.5)] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-[hsl(220,30%,20%)] group-hover:text-[hsl(var(--primary))] transition-colors truncate">
                              {rel.titulo}
                            </p>
                            <p className="text-xs text-[hsl(220,15%,55%)]">
                              {rel.autor} • {formatDate(rel.data)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EstudoDetalhe;
