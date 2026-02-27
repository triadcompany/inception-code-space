import { useState, useEffect } from "react";
import { User, Calendar, BookOpen, ArrowRight, Search, ChevronDown, ChevronRight, Layers } from "lucide-react";
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
  const [selectedTema, setSelectedTema] = useState<string | null>(null);

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
    const matchesSearch =
      e.titulo.toLowerCase().includes(term) ||
      e.autor.toLowerCase().includes(term) ||
      resumoText.includes(term);
    const matchesTema = selectedTema === null || e.tema_id === selectedTema;
    return matchesSearch && matchesTema;
  });

  const toggleTema = (id: string) => {
    setOpenTemas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const estudosByTema = temas
    .map((tema) => ({
      tema,
      estudos: filtered.filter((e) => e.tema_id === tema.id),
    }))
    .filter((g) => g.estudos.length > 0);

  const estudosSemTema = filtered.filter((e) => !e.tema_id);

  const getEstudosCountForTema = (temaId: string) =>
    estudos.filter((e) => e.tema_id === temaId).length;

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(220,20%,97%)]">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative pt-24 pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,12%)] via-[hsl(218,45%,16%)] to-[hsl(218,40%,22%)]" />
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[hsl(var(--primary))] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[hsl(var(--primary))] rounded-full blur-[150px]" />
          </div>

          <div className="container mx-auto max-w-5xl px-4 relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[hsl(var(--primary))] text-xs font-medium mb-4 animate-fade-in-up">
                <BookOpen className="w-3.5 h-3.5" />
                Biblioteca de Estudos
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                Estudos Bíblicos
              </h1>
              <p className="text-[hsl(215,20%,70%)] text-base md:text-lg max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                A mensagem do sétimo anjo nos ensinou a<br className="hidden sm:block" /> ler a bíblia pelos olhos de Deus.
              </p>
            </div>

            {/* Search */}
            <div className="max-w-lg mx-auto relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[hsl(215,20%,50%)]" />
              <Input
                placeholder="Buscar por título, autor ou tema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-white/10 border-white/15 text-white placeholder:text-[hsl(215,20%,50%)] focus:bg-white/15 focus:border-[hsl(var(--primary))] transition-all duration-300 text-sm"
              />
            </div>

            {/* Stats pills */}
            <div className="flex items-center justify-center gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10">
                <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                <span className="text-sm font-semibold text-white">{estudos.length}</span>
                <span className="text-xs text-[hsl(215,20%,60%)]">Estudos</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10">
                <Layers className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                <span className="text-sm font-semibold text-white">{temas.length}</span>
                <span className="text-xs text-[hsl(215,20%,60%)]">Temas</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tema filter chips */}
        {temas.length > 0 && (
          <section className="px-4 -mt-5 relative z-20">
            <div className="container mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center justify-center gap-2 bg-white rounded-2xl shadow-sm border border-[hsl(220,20%,92%)] p-3">
                <button
                  onClick={() => setSelectedTema(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTema === null
                      ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                      : "text-[hsl(220,15%,45%)] hover:bg-[hsl(220,20%,96%)]"
                  }`}
                >
                  Todos
                </button>
                {temas.map((tema) => (
                  <button
                    key={tema.id}
                    onClick={() => setSelectedTema(selectedTema === tema.id ? null : tema.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      selectedTema === tema.id
                        ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                        : "text-[hsl(220,15%,45%)] hover:bg-[hsl(220,20%,96%)]"
                    }`}
                  >
                    {tema.nome}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedTema === tema.id
                        ? "bg-white/20 text-white"
                        : "bg-[hsl(220,20%,93%)] text-[hsl(220,15%,55%)]"
                    }`}>
                      {getEstudosCountForTema(tema.id)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="px-4 py-10">
          <div className="container mx-auto max-w-5xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--primary)/0.2)]" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[hsl(var(--primary))] animate-spin" />
                </div>
                <p className="text-sm text-[hsl(220,15%,55%)]">Carregando estudos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[hsl(220,20%,92%)]">
                <BookOpen className="w-14 h-14 text-[hsl(220,20%,85%)] mx-auto mb-3" />
                <p className="text-[hsl(220,15%,40%)] font-semibold text-lg">
                  {searchTerm || selectedTema ? "Nenhum estudo encontrado." : "Nenhum estudo disponível."}
                </p>
                <p className="text-[hsl(220,15%,60%)] text-sm mt-1">
                  {searchTerm ? "Tente termos diferentes." : "Volte em breve para novos conteúdos."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {estudosByTema.map(({ tema, estudos: temaEstudos }) => (
                  <TemaSection
                    key={tema.id}
                    tema={tema}
                    estudos={temaEstudos}
                    isOpen={openTemas.has(tema.id)}
                    onToggle={() => toggleTema(tema.id)}
                    formatDate={formatDate}
                    getResumoPreview={getResumoPreview}
                  />
                ))}

                {estudosSemTema.length > 0 && (
                  <div className="animate-fade-in-up">
                    {estudosByTema.length > 0 && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-8 rounded-full bg-[hsl(220,20%,75%)]" />
                        <h2 className="text-lg md:text-xl font-display font-bold text-[hsl(220,30%,20%)]">
                          Outros Estudos
                        </h2>
                        <span className="text-[10px] font-semibold text-[hsl(220,15%,55%)] bg-[hsl(220,20%,93%)] px-2 py-0.5 rounded-full">
                          {estudosSemTema.length}
                        </span>
                      </div>
                    )}
                    <div className="grid gap-3">
                      {estudosSemTema.map((estudo, i) => (
                        <EstudoCard
                          key={estudo.id}
                          estudo={estudo}
                          index={i}
                          formatDate={formatDate}
                          getResumoPreview={getResumoPreview}
                        />
                      ))}
                    </div>
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

/* ─── Tema Section ─── */
const TemaSection = ({
  tema,
  estudos,
  isOpen,
  onToggle,
  formatDate,
  getResumoPreview,
}: {
  tema: Tema;
  estudos: Estudo[];
  isOpen: boolean;
  onToggle: () => void;
  formatDate: (d: string) => string;
  getResumoPreview: (r: string | null) => string;
}) => (
  <div className="animate-fade-in-up">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-[hsl(220,20%,90%)] hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md hover:shadow-[hsl(var(--primary)/0.04)] transition-all duration-300 group mb-3"
    >
      <div className="w-1.5 self-stretch rounded-full bg-[hsl(var(--primary))]" />
      <div className="flex-1 text-left">
        <h2 className="text-lg md:text-xl font-display font-bold text-[hsl(220,30%,20%)] group-hover:text-[hsl(var(--primary))] transition-colors">
          {tema.nome}
        </h2>
        {tema.descricao && (
          <p className="text-xs text-[hsl(220,15%,55%)] mt-0.5">{tema.descricao}</p>
        )}
      </div>
      <span className="text-[10px] font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] px-2.5 py-1 rounded-full">
        {estudos.length} {estudos.length === 1 ? "estudo" : "estudos"}
      </span>
      <ChevronDown
        className={`w-4 h-4 text-[hsl(220,15%,55%)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>

    <div
      className={`grid gap-3 overflow-hidden transition-all duration-400 ${
        isOpen ? "grid-rows-[1fr] opacity-100 pl-5 border-l-2 border-[hsl(220,20%,90%)] ml-3" : "grid-rows-[0fr] opacity-0 max-h-0"
      }`}
    >
      <div className="min-h-0">
        {isOpen && estudos.map((estudo, i) => (
          <div key={estudo.id} className="mb-3 last:mb-0">
            <EstudoCard estudo={estudo} index={i} formatDate={formatDate} getResumoPreview={getResumoPreview} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Estudo Card ─── */
const EstudoCard = ({
  estudo,
  index,
  formatDate,
  getResumoPreview,
}: {
  estudo: Estudo;
  index: number;
  formatDate: (d: string) => string;
  getResumoPreview: (r: string | null) => string;
}) => (
  <Link
    to={`/estudos/${estudo.id}`}
    className="group flex items-center gap-4 bg-white rounded-xl border border-[hsl(220,20%,92%)] hover:border-[hsl(var(--primary)/0.35)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.06)] transition-all duration-300 p-4 sm:p-5 animate-fade-in-up"
    style={{ animationDelay: `${index * 0.04}s` }}
  >
    <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.12)] to-[hsl(var(--primary)/0.04)] flex items-center justify-center group-hover:from-[hsl(var(--primary)/0.2)] group-hover:to-[hsl(var(--primary)/0.08)] transition-all duration-300">
      <BookOpen className="w-5 h-5 text-[hsl(var(--primary))]" />
    </div>

    <div className="flex-1 min-w-0">
      <h3 className="font-display font-semibold text-[hsl(220,30%,20%)] text-[0.95rem] sm:text-base group-hover:text-[hsl(var(--primary))] transition-colors duration-200 leading-snug">
        {estudo.titulo}
      </h3>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1">
        <span className="flex items-center gap-1.5 text-xs text-[hsl(220,15%,50%)]">
          <User className="w-3 h-3 text-[hsl(var(--primary)/0.6)]" />
          {estudo.autor}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[hsl(220,15%,50%)]">
          <Calendar className="w-3 h-3 text-[hsl(var(--primary)/0.6)]" />
          {formatDate(estudo.data)}
        </span>
      </div>
      {estudo.resumo && (
        <p className="text-xs text-[hsl(220,15%,55%)] mt-1.5 line-clamp-2 leading-relaxed">
          {getResumoPreview(estudo.resumo)}
        </p>
      )}
    </div>

    <div className="flex-shrink-0 hidden sm:block">
      <div className="w-8 h-8 rounded-full bg-[hsl(220,20%,96%)] group-hover:bg-[hsl(var(--primary))] flex items-center justify-center transition-all duration-300">
        <ArrowRight className="w-3.5 h-3.5 text-[hsl(220,15%,55%)] group-hover:text-white transition-colors duration-300" />
      </div>
    </div>
  </Link>
);

export default EstudosBiblicos;
