import { Play, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import heroBgFallback from "@/assets/hero-bg-custom.jpg";

const HeroSection = () => {
  const { data: cfg } = useSiteConfig();

  const bgImage = cfg?.hero_imagem || heroBgFallback;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-[hsl(220,50%,18%)] opacity-70" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in-up">
        {cfg?.hero_boas_vindas && (
          <p className="text-foreground/70 text-sm tracking-widest uppercase mb-2">
            {cfg.hero_boas_vindas}
          </p>
        )}

        <p className="font-display text-3xl md:text-4xl tracking-widest mb-1 font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
          {cfg?.hero_titulo || "Tabernáculo"}
        </p>
        <h1 className="text-5xl md:text-6xl leading-tight font-display font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent mb-7">
          {cfg?.hero_subtitulo || "O Filho do Homem"}
        </h1>

        {cfg?.hero_versiculo && (
          <div className="rounded-xl px-8 py-5 mb-9 max-w-xl mx-auto bg-white/5 backdrop-blur-md border border-white/5">
            <p className="italic text-foreground/80 text-[15px] leading-relaxed">
              "{cfg.hero_versiculo}"
            </p>
            {cfg.hero_referencia && (
              <p className="text-gold text-sm mt-2.5 font-semibold">{cfg.hero_referencia}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/ao-vivo"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-2.5 rounded-md font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Assistir Culto ao Vivo
          </Link>
          <Link
            to="/cultos"
            className="inline-flex items-center justify-center gap-2 bg-secondary/80 text-secondary-foreground px-7 py-2.5 rounded-md font-semibold text-sm hover:bg-secondary transition-colors border border-border/30"
          >
            Ver Cultos Anteriores
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
