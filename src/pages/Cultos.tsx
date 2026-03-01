import { useState, useEffect, useMemo } from "react";
import { Search, Play, Video, Calendar, User, Sparkles, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Culto {
  id: string;
  titulo: string;
  data: string;
  pregador: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  descricao: string | null;
  resumo: string | null;
  tipo: string;
}

const PAGE_SIZE = 500;

const Cultos = () => {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pregador, setPregador] = useState("todos");
  const [ano, setAno] = useState("todos");
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    // Check if user is approved member
    const checkMember = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("approved")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setIsMember(!!profile?.approved);
      }
    };
    checkMember();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let from = 0;
        let allCultos: Culto[] = [];

        while (true) {
          const to = from + PAGE_SIZE - 1;
          const { data, error } = await supabase
            .from("cultos" as any)
            .select("id, titulo, data, pregador, video_url, thumbnail_url, descricao, resumo, tipo")
            .eq("status", "publicado")
            .order("data", { ascending: false })
            .range(from, to);

          if (error) throw error;

          const batch = ((data as any) || []) as Culto[];
          allCultos = [...allCultos, ...batch];

          if (batch.length < PAGE_SIZE) break;
          from += PAGE_SIZE;
        }

        setCultos(allCultos);
      } catch (error) {
        console.error("Erro ao carregar cultos:", error);
        setCultos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pregadores = useMemo(() => {
    const set = new Set(cultos.map((c) => c.pregador).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [cultos]);

  const anos = useMemo(() => {
    const set = new Set(cultos.map((c) => c.data.slice(0, 4)));
    return Array.from(set).sort().reverse();
  }, [cultos]);

  const filtered = useMemo(() => {
    return cultos.filter((c) => {
      if (pregador !== "todos" && c.pregador !== pregador) return false;
      if (ano !== "todos" && !c.data.startsWith(ano)) return false;
      if (busca && !c.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
      if (tipoFiltro !== "todos" && (c.tipo || "geral") !== tipoFiltro) return false;
      return true;
    });
  }, [cultos, pregador, ano, busca, tipoFiltro]);

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const hasActiveFilters = pregador !== "todos" || ano !== "todos" || busca !== "" || tipoFiltro !== "todos";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-20 w-80 h-80 bg-[hsl(var(--primary))] rounded-full blur-[130px]" />
            <div className="absolute bottom-0 right-10 w-96 h-96 bg-[hsl(var(--primary))] rounded-full blur-[150px]" />
          </div>

          <div className="container mx-auto max-w-5xl px-4 relative z-10 text-center">

            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Cultos
            </h1>
            <p className="text-[hsl(215,20%,75%)] text-lg max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Assista aos cultos do Tabernáculo O Filho do Homem
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">{cultos.length}</p>
                <p className="text-xs text-[hsl(215,20%,65%)]">Cultos</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[hsl(var(--primary))]">{pregadores.length}</p>
                <p className="text-xs text-[hsl(215,20%,65%)]">Pregadores</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 -mt-6 relative z-10 mb-8">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-[hsl(220,20%,92%)] p-4 md:p-5 animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              {/* Tipo filter tabs - only for members */}
              {isMember && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setTipoFiltro("todos")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      tipoFiltro === "todos"
                        ? "bg-[hsl(var(--primary))] text-white"
                        : "bg-[hsl(220,20%,96%)] text-[hsl(220,15%,45%)] hover:bg-[hsl(220,20%,93%)]"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setTipoFiltro("jovens")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      tipoFiltro === "jovens"
                        ? "bg-purple-600 text-white"
                        : "bg-[hsl(220,20%,96%)] text-[hsl(220,15%,45%)] hover:bg-[hsl(220,20%,93%)]"
                    }`}
                  >
                    🎵 Culto de Jovens
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,15%,55%)]" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por título..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-11 h-11 rounded-xl bg-[hsl(220,20%,97%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] placeholder:text-[hsl(220,15%,60%)] focus:border-[hsl(var(--primary))] transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={pregador}
                    onChange={(e) => setPregador(e.target.value)}
                    className="flex-1 md:flex-none bg-[hsl(220,20%,97%)] text-[hsl(220,30%,20%)] border border-[hsl(220,20%,90%)] rounded-xl px-3 md:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="todos">Pregador: Todos</option>
                    {pregadores.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <select
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="flex-1 md:flex-none bg-[hsl(220,20%,97%)] text-[hsl(220,30%,20%)] border border-[hsl(220,20%,90%)] rounded-xl px-3 md:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="todos">Ano: Todos</option>
                    {anos.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[hsl(220,20%,93%)]">
                  <Filter className="w-3.5 h-3.5 text-[hsl(220,15%,55%)]" />
                  <span className="text-xs text-[hsl(220,15%,55%)]">
                    {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"} encontrado{filtered.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => { setPregador("todos"); setAno("todos"); setBusca(""); setTipoFiltro("todos"); }}
                    className="text-xs text-[hsl(var(--primary))] hover:underline ml-auto cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cultos Grid */}
        <section className="px-4 pb-20">
          <div className="container mx-auto max-w-5xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--primary)/0.2)]" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[hsl(var(--primary))] animate-spin" />
                </div>
                <p className="text-sm text-[hsl(220,15%,55%)]">Carregando cultos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Video className="w-16 h-16 text-[hsl(220,20%,85%)] mx-auto mb-4" />
                <p className="text-[hsl(220,15%,45%)] font-medium text-lg">
                  {busca || pregador !== "todos" || ano !== "todos"
                    ? "Nenhum culto encontrado para os filtros aplicados."
                    : "Nenhum culto disponível no momento."}
                </p>
                <p className="text-[hsl(220,15%,65%)] text-sm mt-2">
                  {hasActiveFilters ? "Tente termos ou filtros diferentes." : "Volte em breve para novos conteúdos."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((culto, index) => (
                  <Link
                    key={culto.id}
                    to={`/cultos/${culto.id}`}
                    className="group bg-white rounded-2xl border border-[hsl(220,20%,92%)] overflow-hidden hover:border-[hsl(var(--primary)/0.4)] hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.08)] transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)] overflow-hidden">
                      {culto.thumbnail_url ? (
                        <img
                          src={culto.thumbnail_url}
                          alt={culto.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                            <Play className="w-7 h-7 text-white/60" />
                          </div>
                        </div>
                      )}

                      {/* Play overlay */}
                      {culto.video_url && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                          </div>
                        </div>
                      )}

                      {/* Video badge */}
                      {culto.video_url && (
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-dot" />
                          <span className="text-[10px] font-medium text-white">VÍDEO</span>
                        </div>
                      )}
                      {/* Jovens badge */}
                      {(culto.tipo === "jovens") && (
                        <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                          <span className="text-[10px] font-medium text-white">🎵 JOVENS</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-[hsl(220,30%,20%)] text-base group-hover:text-[hsl(var(--primary))] transition-colors duration-300">
                        {culto.titulo}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                        <span className="flex items-center gap-1.5 text-xs text-[hsl(220,15%,50%)]">
                          <Calendar className="w-3 h-3 text-[hsl(var(--primary))]" />
                          {formatDate(culto.data)}
                        </span>
                        {culto.pregador && (
                          <span className="flex items-center gap-1.5 text-xs text-[hsl(220,15%,50%)]">
                            <User className="w-3 h-3 text-[hsl(var(--primary))]" />
                            {culto.pregador}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cultos;
