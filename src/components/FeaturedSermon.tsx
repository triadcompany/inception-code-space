import { Link } from "react-router-dom";

const FeaturedSermon = () => {
  return (
    <section className="py-16 bg-navy-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-gold text-sm font-medium tracking-wider uppercase mb-2">Destaque</p>
          <h2 className="text-3xl font-display font-bold text-foreground">Último Culto</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl overflow-hidden bg-card border border-border/30">
            <div className="aspect-video relative overflow-hidden">
              <img
                src="https://img.youtube.com/vi/rdrYztN9VOw/maxresdefault.jpg"
                alt="Último culto"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-navy-dark/30" />
            </div>
            <div className="p-6">
              <p className="text-muted-foreground text-sm mb-2">25 de fevereiro de 2026</p>
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                Conscientes Que Deus é Poderoso Para Cumprir Tudo Que Prometeu
              </h3>
              <Link
                to="/cultos"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
              >
                Assistir Agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSermon;
