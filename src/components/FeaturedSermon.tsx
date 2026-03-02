import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Play } from "lucide-react";

const FeaturedSermon = () => {
  const [playing, setPlaying] = useState(false);
  const youtubeId = "rdrYztN9VOw";

  return (
    <section className="py-12 md:py-20 bg-foreground">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-0.5 bg-gold rounded" />
            <p className="text-gold text-sm md:text-base font-semibold tracking-widest uppercase">Destaque</p>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-navy">Último Culto</h2>
        </div>

        <div className="mx-auto">
          <div className="rounded-2xl md:rounded-[24px] overflow-hidden bg-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col md:flex-row">
            {/* Thumbnail */}
            <div className="md:w-3/5 aspect-video md:aspect-auto relative overflow-hidden md:min-h-[420px]">
              {playing ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
                  title="Último culto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full absolute inset-0"
                />
              ) : (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                    alt="Último culto"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label="Reproduzir vídeo"
                  >
                    <div className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full bg-gold/90 flex items-center justify-center shadow-xl hover:bg-gold transition-colors">
                      <Play className="w-6 h-6 md:w-8 md:h-8 text-navy fill-navy ml-0.5" />
                    </div>
                  </button>
                </>
              )}
            </div>
            {/* Content */}
            <div className="md:w-2/5 p-5 sm:p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                <p className="text-navy/60 text-sm md:text-base font-medium">25 de fevereiro de 2026</p>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-navy mb-4 md:mb-6 leading-snug">
                Conscientes Que Deus é Poderoso Para Cumprir Tudo Que Prometeu
              </h3>
              <div>
                <Link
                  to="/cultos"
                  className="inline-flex items-center gap-2 bg-gold text-navy px-5 sm:px-7 py-3 md:py-3.5 rounded-lg text-sm md:text-base font-semibold hover:bg-gold-light transition-colors"
                >
                  Assistir Agora
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSermon;
