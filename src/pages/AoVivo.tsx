import { Radio, Calendar, Clock, MapPin, Youtube } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Extract YouTube video ID from various URL formats */
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
};

/** Hook to check for active YouTube live streams automatically */
function useYoutubeLiveCheck() {
  return useQuery({
    queryKey: ["youtube-live-check"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("youtube-live-check");
      if (error) throw error;
      return data as { live: boolean; videoId?: string; title?: string; thumbnail?: string };
    },
    refetchInterval: 60_000, // poll every 60 seconds
    staleTime: 30_000,
    retry: 1,
  });
}

const AoVivo = () => {
  const { data: config, isLoading: configLoading } = useSiteConfig();
  const { data: liveData, isLoading: liveLoading } = useYoutubeLiveCheck();

  const aoVivoUrl = config?.ao_vivo_url || "";
  const youtubeChannel = config?.social_youtube || "";

  // Priority: 1) auto-detected live stream, 2) manual URL from admin
  const autoVideoId = liveData?.live ? liveData.videoId : null;
  const manualVideoId = extractYouTubeId(aoVivoUrl);
  const videoId = autoVideoId || manualVideoId;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  const isLive = !!autoVideoId;
  const hasVideo = !!embedUrl;
  const isLoading = configLoading || liveLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-24 pb-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,12%)] via-[hsl(218,45%,16%)] to-[hsl(218,40%,22%)]" />
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary rounded-full blur-[150px]" />
          </div>

          <div className="container mx-auto max-w-5xl px-4 relative z-10 text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 animate-fade-in-up ${
              isLive ? "bg-red-500/20 text-red-300" : "bg-white/10 text-primary"
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLive ? "bg-red-500" : "bg-primary"}`} />
              {isLive ? "Ao Vivo Agora" : "Transmissão ao Vivo"}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Culto ao Vivo
            </h1>
            <p className="text-[hsl(215,20%,70%)] text-base md:text-lg max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              {isLive ? "Estamos transmitindo agora — assista abaixo" : "Acompanhe nossas transmissões em tempo real"}
            </p>
          </div>
        </section>

        {/* Video / Player area */}
        <section className="px-4 -mt-8 relative z-20">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              {isLoading ? (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                </div>
              ) : embedUrl ? (
                <>
                  <div className="aspect-video">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Transmissão ao Vivo"
                    />
                  </div>
                  {(liveData?.title) && (
                    <div className="px-5 py-4 border-t border-border">
                      <h2 className="text-base font-display font-semibold text-foreground">{liveData.title}</h2>
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-[hsl(218,48%,14%)] to-[hsl(218,40%,22%)] flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                    <Radio className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center px-4">
                    <h2 className="text-white font-display font-bold text-xl mb-2">
                      Nenhuma transmissão no momento
                    </h2>
                    <p className="text-[hsl(215,20%,60%)] text-sm max-w-md">
                      Confira nossos horários de culto abaixo ou acesse nosso canal no YouTube para assistir transmissões anteriores.
                    </p>
                  </div>
                  {youtubeChannel && (
                    <a
                      href={youtubeChannel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Youtube className="w-4 h-4" />
                      Acessar Canal no YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Schedule info */}
        <section className="px-4 py-14">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-xl font-display font-bold text-foreground mb-6 text-center">
              Horários dos Cultos
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { day: "Sábado", times: ["18h30"], icon: Calendar },
                { day: "Domingo", times: ["17h30"], icon: Calendar },
                { day: "Quarta-feira", times: ["19h30"], icon: Clock },
              ].map((item) => (
                <div
                  key={item.day}
                  className="bg-card rounded-xl border border-border p-5 text-center hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <item.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                  <h3 className="font-display font-semibold text-foreground text-base mb-2">
                    {item.day}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {item.times.map((t) => (
                      <span key={t} className="text-muted-foreground text-sm">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {config?.contato_endereco1 && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {config.contato_endereco1}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AoVivo;
