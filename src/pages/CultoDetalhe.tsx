import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Share2, Play } from "lucide-react";
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
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen flex flex-col bg-white text-[hsl(220,30%,20%)]">
      <Navbar />
      <main className="flex-1">

      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back */}
          <Link to="/cultos" className="inline-flex items-center gap-2 text-sm text-[hsl(220,15%,55%)] hover:text-[hsl(220,30%,20%)] mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar aos Cultos
          </Link>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !culto ? (
            <p className="text-center text-[hsl(220,15%,55%)] py-20">Culto não encontrado.</p>
          ) : (
            <>
              {/* Video */}
              {youtubeId ? (
                <div className="rounded-xl overflow-hidden aspect-video bg-black mb-8">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={culto.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : culto.thumbnail_url ? (
                <div className="rounded-xl overflow-hidden aspect-video bg-muted mb-8 relative">
                  <img src={culto.thumbnail_url} alt={culto.titulo} className="w-full h-full object-cover" />
                  {culto.video_url && (
                    <a href={culto.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-16 h-16 text-white" />
                    </a>
                  )}
                </div>
              ) : null}

              {/* Info */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-[hsl(220,30%,20%)]">{culto.titulo}</h1>
                  <div className="flex items-center gap-5 mt-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-[hsl(220,20%,35%)]">
                      <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />{formatDate(culto.data)}
                    </span>
                    {culto.pregador && (
                      <span className="flex items-center gap-2 text-sm font-medium text-[hsl(220,20%,35%)]">
                        <User className="w-4 h-4 text-[hsl(var(--primary))]" />{culto.pregador}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex-shrink-0 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                </Button>
              </div>

              {culto.descricao && (
                <div className="prose prose-sm max-w-none text-[hsl(220,30%,20%)] mb-8" dangerouslySetInnerHTML={{ __html: culto.descricao }} />
              )}
              {culto.resumo && !culto.descricao && (
                <div className="prose prose-sm max-w-none text-[hsl(220,30%,20%)] mb-8" dangerouslySetInnerHTML={{ __html: culto.resumo }} />
              )}
            </>
          )}
        </div>
      </div>

      </main>
      <Footer />
    </div>
  );
};

export default CultoDetalhe;
