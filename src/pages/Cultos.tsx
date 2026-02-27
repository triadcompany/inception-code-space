import { useState, useEffect, useMemo } from "react";
import { Search, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Culto {
  id: string;
  titulo: string;
  data: string;
  pregador: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  descricao: string | null;
  resumo: string | null;
}

const Cultos = () => {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pregador, setPregador] = useState("todos");
  const [ano, setAno] = useState("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("cultos" as any)
        .select("id, titulo, data, pregador, video_url, thumbnail_url, descricao, resumo")
        .eq("status", "publicado")
        .order("data", { ascending: false });
      setCultos((data as any) || []);
      setLoading(false);
    };
    fetch();
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
      return true;
    });
  }, [cultos, pregador, ano, busca]);

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Cultos</h1>
          <p className="text-muted-foreground text-sm">Assista aos cultos e pregações do Tabernáculo O Filho do Homem.</p>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row gap-3">
          <select value={pregador} onChange={(e) => setPregador(e.target.value)} className="bg-card text-foreground border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="todos">Pregador: Todos</option>
            {pregadores.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={ano} onChange={(e) => setAno(e.target.value)} className="bg-card text-foreground border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="todos">Ano: Todos</option>
            {anos.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Pesquisar por título..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-card text-foreground border border-border rounded-md pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-5xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-16">Nenhum culto encontrado.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((culto) => (
                <Link
                  key={culto.id}
                  to={`/cultos/${culto.id}`}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video bg-muted">
                    {culto.thumbnail_url ? (
                      <img src={culto.thumbnail_url} alt={culto.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    {culto.video_url && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2">{culto.titulo}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(culto.data)}
                      {culto.pregador && ` • ${culto.pregador}`}
                    </p>
                    
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cultos;
