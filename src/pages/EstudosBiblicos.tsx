import { useState, useEffect } from "react";
import { User, Calendar, BookOpen, ArrowRight, Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Tema {
  id: string;
  nome: string;
  descricao: string | null;
}

interface Estudo {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  resumo: string | null;
  conteudo: string | null;
  tema_id: string | null;
}

const EstudosBiblicos = () => {
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openTemas, setOpenTemas] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const [estudosRes, temasRes] = await Promise.all([
        supabase
          .from("estudos" as any)
          .select("id, titulo, autor, data, resumo, conteudo, tema_id")
          .eq("publicado", true)
          .order("data", { ascending: false }),
        supabase
          .from("temas" as any)
          .select("id, nome, descricao")
          .eq("publicado", true)
          .order("ordem", { ascending: true }),
      ]);
      setEstudos((estudosRes.data as any) || []);
      const fetchedTemas = (temasRes.data as any) || [];
      setTemas(fetchedTemas);
      // Open all temas by default
      setOpenTemas(new Set(fetchedTemas.map((t: Tema) => t.id)));
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const getResumoPreview = (resumo: string | null) => {
    if (!resumo) return "";
    const decoded = new DOMParser().parseFromString(resumo, "text/html").documentElement.textContent || "";
    return decoded.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  };

  const filtered = estudos.filter((e) => {
    const resumoText = getResumoPreview(e.resumo).toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      e.titulo.toLowerCase().includes(term) ||
      e.autor.toLowerCase().includes(term) ||
      resumoText.includes(term)
    );
  });

  const toggleTema = (id: string) => {
    setOpenTemas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group filtered estudos by tema
  const estudosByTema = temas
    .map((tema) => ({
      tema,
      estudos: filtered.filter((e) => e.tema_id === tema.id),
    }))
    .filter((g) => g.estudos.length > 0);

  const estudosSemTema = filtered.filter((e) => !e.tema_id);

  const EstudoCard = ({ estudo, index }: { estudo: Estudo; index: number }) => (
    <Link
      to={`/estudos/${estudo.id}`}
      className="group block bg-white rounded-2xl border border-[hsl(220,20%,92%)] hover:border-[hsl(var(--primary)/0.4)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.08)] transition-all duration-300 overflow-hidden animate-fade-in-up p-4 sm:p-6"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="flex items-start gap-3 sm:gap-5">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] flex items-center justify-center group-hover:from-[hsl(var(--primary)/0.2)] group-hover:to-[hsl(var(--primary)/0.1)] transition-all duration-300">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--primary))]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-[hsl(220,30%,20%)] text-base sm:text-lg group-hover:text-[hsl(var(--primary))] transition-colors duration-300">
            {estudo.titulo}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-[hsl(220,15%,50%)]">
              <User className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              {estudo.autor}
            </span>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-[hsl(220,15%,50%)]">
              <Calendar className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              {formatDate(estudo.data)}
            </span>
          </div>
          {estudo.resumo && (
            <p className="text-sm text-[hsl(220,15%,55%)] mt-2 line-clamp-2 leading-relaxed">
              {getResumoPreview(estudo.resumo)}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 mt-1 hidden sm:block">
          <div className="w-9 h-9 rounded-full bg-[hsl(220,20%,96%)] group-hover:bg-[hsl(var(--primary))] flex items-center justify-center transition-all duration-300">
            <ArrowRight className="w-4 h-4 text-[hsl(220,15%,50%)] group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[hsl(var(--primary))] rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[hsl(var(--primary))] rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto max-w-4xl px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Estudos Bíblicos
          </h1>
          <p className="text-[hsl(215,20%,75%)] text-lg max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            A mensagem do sétimo anjo nos ensinou a<br />ler a bíblia pelos olhos de Deus.
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto relative animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(215,20%,55%)]" />
            <Input
              placeholder="Buscar por título, autor ou tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-[hsl(215,20%,55%)] focus:bg-white/15 focus:border-[hsl(var(--primary))] transition-all duration-300"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">{estudos.length}</p>
              <p className="text-xs text-[hsl(215,20%,65%)]">Estudos</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">{temas.length}</p>
              <p className="text-xs text-[hsl(215,20%,65%)]">Temas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Estudos List */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--primary)/0.2)]" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[hsl(var(--primary))] animate-spin" />
              </div>
              <p className="text-sm text-[hsl(220,15%,55%)]">Carregando estudos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-[hsl(220,20%,85%)] mx-auto mb-4" />
              <p className="text-[hsl(220,15%,45%)] font-medium text-lg">
                {searchTerm ? "Nenhum estudo encontrado para sua busca." : "Nenhum estudo disponível no momento."}
              </p>
              <p className="text-[hsl(220,15%,65%)] text-sm mt-2">
                {searchTerm ? "Tente termos diferentes." : "Volte em breve para novos conteúdos."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Temas sections */}
              {estudosByTema.map(({ tema, estudos: temaEstudos }) => (
                <div key={tema.id} className="animate-fade-in-up">
                  <button
                    onClick={() => toggleTema(tema.id)}
                    className="w-full flex items-center gap-3 mb-4 group cursor-pointer"
                  >
                    <div className="w-1 h-8 rounded-full bg-[hsl(var(--primary))]" />
                    <div className="flex-1 text-left">
                      <h2 className="text-xl md:text-2xl font-display font-bold text-[hsl(220,30%,20%)] group-hover:text-[hsl(var(--primary))] transition-colors">
                        {tema.nome}
                      </h2>
                      {tema.descricao && (
                        <p className="text-sm text-[hsl(220,15%,55%)]">{tema.descricao}</p>
                      )}
                    </div>
                    <span className="text-xs text-[hsl(220,15%,55%)] bg-[hsl(220,20%,96%)] px-2 py-1 rounded-full">
                      {temaEstudos.length} {temaEstudos.length === 1 ? "estudo" : "estudos"}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[hsl(220,15%,55%)] transition-transform duration-300 ${openTemas.has(tema.id) ? "rotate-180" : ""}`} />
                  </button>

                  {openTemas.has(tema.id) && (
                    <div className="space-y-4 pl-4 border-l-2 border-[hsl(220,20%,92%)]">
                      {temaEstudos.map((estudo, i) => (
                        <EstudoCard key={estudo.id} estudo={estudo} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Estudos sem tema */}
              {estudosSemTema.length > 0 && estudosByTema.length > 0 && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 rounded-full bg-[hsl(220,20%,80%)]" />
                    <h2 className="text-xl md:text-2xl font-display font-bold text-[hsl(220,30%,20%)]">
                      Outros Estudos
                    </h2>
                    <span className="text-xs text-[hsl(220,15%,55%)] bg-[hsl(220,20%,96%)] px-2 py-1 rounded-full">
                      {estudosSemTema.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Show estudos sem tema (or all if no temas) */}
              {estudosSemTema.length > 0 && (
                <div className={`space-y-4 ${estudosByTema.length > 0 ? "pl-4 border-l-2 border-[hsl(220,20%,92%)]" : ""}`}>
                  {estudosSemTema.map((estudo, i) => (
                    <EstudoCard key={estudo.id} estudo={estudo} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default EstudosBiblicos;
