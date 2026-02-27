import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Share2, Play, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

const extractYoutubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const CultoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const [culto, setCulto] = useState<Culto | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("cultos" as any)
        .select("id, titulo, data, pregador, video_url, thumbnail_url, descricao, resumo")
        .eq("id", id)
        .eq("status", "publicado")
        .single();
      setCulto(data as any);
      setLoading(false);
      // trigger entrance animation
      requestAnimationFrame(() => setVisible(true));
    };
    fetch();
  }, [id]);

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const handleShare = async () => {
    try {
      await navigator.share({ title: culto?.titulo, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado!" });
    }
  };

  const youtubeId = culto?.video_url ? extractYoutubeId(culto.video_url) : null;
  const hasContent = culto?.descricao || culto?.resumo;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[hsl(220,30%,96%)] text-foreground">
      <Navbar />

      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back link */}
          <Link
            to="/cultos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Voltar aos Cultos
          </Link>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            </div>
          ) : !culto ? (
            <p className="text-center text-muted-foreground py-20 text-lg">Culto não encontrado.</p>
          ) : (
            <div
              className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              {/* Video Section */}
              {youtubeId ? (
                <div className="rounded-2xl overflow-hidden aspect-video bg-black mb-10 shadow-2xl ring-1 ring-black/10">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={culto.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : culto.thumbnail_url ? (
                <div className="rounded-2xl overflow-hidden aspect-video bg-muted mb-10 relative shadow-2xl ring-1 ring-black/10 group">
                  <img
                    src={culto.thumbnail_url}
                    alt={culto.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {culto.video_url && (
                    <a
                      href={culto.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-8 h-8 text-primary-foreground ml-1" />
                      </div>
                    </a>
                  )}
                </div>
              ) : null}

              {/* Title & Meta Card */}
              <div
                className={`bg-white rounded-2xl p-6 md:p-8 shadow-lg ring-1 ring-black/5 mb-8 transition-all duration-700 delay-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-4xl font-display font-bold text-[hsl(220,30%,15%)] leading-tight">
                      {culto.titulo}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--primary)/0.1)] text-sm font-semibold text-[hsl(var(--primary))]">
                        <Calendar className="w-4 h-4" />
                        {formatDate(culto.data)}
                      </span>
                      {culto.pregador && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(220,30%,95%)] text-sm font-semibold text-[hsl(220,20%,30%)]">
                          <User className="w-4 h-4 text-primary" />
                          {culto.pregador}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex-shrink-0 rounded-full px-5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-md hover:shadow-primary/20"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>

              {/* Content */}
              {hasContent && (
                <div
                  ref={contentRef}
                  className={`bg-white rounded-2xl p-6 md:p-10 shadow-lg ring-1 ring-black/5 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                  <div className="flex items-center gap-2 mb-6 text-primary">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Conteúdo</span>
                  </div>
                  <div
                    className="prose prose-lg max-w-none prose-headings:text-[hsl(220,30%,15%)] prose-p:text-[hsl(220,15%,35%)] prose-a:text-primary prose-strong:text-[hsl(220,30%,15%)] prose-li:text-[hsl(220,15%,35%)]"
                    dangerouslySetInnerHTML={{ __html: culto.descricao || culto.resumo || "" }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CultoDetalhe;
