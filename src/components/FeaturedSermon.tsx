import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Play } from "lucide-react";

const FeaturedSermon = () => {
  return (
    <section className="py-16 bg-foreground">
      <div className="container mx-auto px-4">
        {/* Header with gold line */}
        <div className="mb-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-0.5 bg-gold rounded" />
            <p className="text-gold text-xs font-semibold tracking-widest uppercase">Destaque</p>
          </div>
          <h2 className="text-3xl font-display font-bold text-navy">Último Culto</h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl overflow-hidden bg-foreground shadow-lg border border-navy/5 flex flex-col md:flex-row">
            {/* Thumbnail with play button */}
            <div className="md:w-3/5 aspect-video md:aspect-auto relative overflow-hidden">
              <img
                src="https://img.youtube.com/vi/rdrYztN9VOw/maxresdefault.jpg"
                alt="Último culto"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-lg hover:bg-gold transition-colors cursor-pointer">
                  <Play className="w-6 h-6 text-navy fill-navy ml-0.5" />
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5 text-gold" />
                <p className="text-navy/60 text-xs font-medium">25 de fevereiro de 2026</p>
              </div>
              <h3 className="text-lg font-bold text-navy mb-5 leading-snug">
                Conscientes Que Deus é Poderoso Para Cumprir Tudo Que Prometeu
              </h3>
              <div>
                <Link
                  to="/cultos"
                  className="inline-flex items-center gap-2 bg-gold text-navy px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
                >
                  Assistir Agora
                  <ArrowRight className="w-3.5 h-3.5" />
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
