import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-4">
          Venha nos Visitar
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Você é sempre bem-vindo em nossa comunidade. Junte-se a nós em nossos cultos e celebre a fé.
        </p>
        <Link
          to="/contato"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-gold-light transition-colors"
        >
          Entre em Contato
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
