import { Play, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-navy-dark/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in-up">
        {/* Logo circle */}
        <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
          <span className="text-gold font-display text-lg font-bold">T</span>
        </div>

        <p className="text-gold font-display text-xl md:text-2xl tracking-wide mb-2">
          Tabernáculo
        </p>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-8">
          O Filho do Homem
        </h1>

        {/* Quote */}
        <div className="quote-card rounded-xl p-6 mb-10 max-w-xl mx-auto">
          <p className="italic text-muted-foreground text-base md:text-lg leading-relaxed">
            "E disse-me: Não seles as palavras da profecia deste livro; porque próximo está o tempo."
          </p>
          <p className="text-gold text-sm mt-3 font-medium">Apocalipse 22:10</p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/ao-vivo"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors"
          >
            <Play className="w-4 h-4" />
            Assistir Culto ao Vivo
          </Link>
          <Link
            to="/cultos"
            className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Ver Cultos Anteriores
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
