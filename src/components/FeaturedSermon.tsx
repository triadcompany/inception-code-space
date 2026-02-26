import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Play } from "lucide-react";

const FeaturedSermon = () => {
  return (
    <section className="py-20 bg-foreground">
      <div className="container mx-auto px-4">
        {/* Header with gold line */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-0.5 bg-gold rounded" />
            <p className="text-gold text-base font-semibold tracking-widest uppercase">Destaque</p>
          </div>
          <h2 className="text-5xl font-display font-bold text-navy">Último Culto</h2>
        </div>

        <div className="mx-auto">
          <div className="rounded-2xl overflow-hidden bg-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col md:flex-row">
            {/* Thumbnail with play button and white gradient fade */}
            <div className="md:w-3/5 aspect-video md:aspect-auto relative overflow-hidden min-h-[350px]">
              <img
                src="https://img.youtube.com/vi/rdrYztN9VOw/maxresdefault.jpg"
                alt="Último culto"
                className="w-full h-full object-cover"
              />
              {/* White gradient fade on the right */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white" />
              {/* White gradient fade on the bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-gold/90 flex items-center justify-center shadow-xl hover:bg-gold transition-colors cursor-pointer">
                  <Play className="w-8 h-8 text-navy fill-navy ml-0.5" />
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gold" />
                <p className="text-navy/60 text-base font-medium">25 de fevereiro de 2026</p>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-6 leading-snug">
                Conscientes Que Deus é Poderoso Para Cumprir Tudo Que Prometeu
              </h3>
              <div>
                <Link
                  to="/cultos"
                  className="inline-flex items-center gap-2 bg-gold text-navy px-7 py-3.5 rounded-lg text-base font-semibold hover:bg-gold-light transition-colors"
                >
                  Assistir Agora
                  <ArrowRight className="w-5 h-5" />
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
