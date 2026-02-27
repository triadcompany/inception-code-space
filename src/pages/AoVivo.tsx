import { useState } from "react";
import { Radio, Calendar, Clock, MapPin, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const AoVivo = () => {
  const { data: config } = useSiteConfig();
  const youtubeChannel = config?.social_youtube || "";

  // Try to extract a YouTube embed URL from the channel link
  const getEmbedUrl = () => {
    if (!youtubeChannel) return null;
    // If it's a channel URL, use the live embed
    if (youtubeChannel.includes("youtube.com/channel/")) {
      const channelId = youtubeChannel.split("/channel/")[1]?.split(/[/?]/)[0];
      return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1`;
    }
    if (youtubeChannel.includes("youtube.com/@")) {
      return null; // Can't embed @handle directly
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-primary text-xs font-medium mb-4 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Transmissão ao Vivo
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Culto ao Vivo
            </h1>
            <p className="text-[hsl(215,20%,70%)] text-base md:text-lg max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              Acompanhe nossas transmissões em tempo real
            </p>
          </div>
        </section>

        {/* Video / Player area */}
        <section className="px-4 -mt-8 relative z-20">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              {embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Transmissão ao Vivo"
                  />
                </div>
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
                      <ExternalLink className="w-4 h-4" />
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
                { day: "Domingo", times: ["09h00", "19h00"], icon: Calendar },
                { day: "Quarta-feira", times: ["19h30"], icon: Clock },
                { day: "Sexta-feira", times: ["20h00"], icon: Clock },
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
                      <span key={t} className="text-muted-foreground text-sm">
                        {t}
                      </span>
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
