import { MonitorPlay, BookOpen, Radio, Info } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  { icon: MonitorPlay, title: "Cultos", desc: "Gravações dos cultos", to: "/cultos" },
  { icon: BookOpen, title: "Estudos", desc: "Estudos bíblicos", to: "/estudos" },
  { icon: Radio, title: "Ao Vivo", desc: "Transmissão ao vivo", to: "/ao-vivo" },
  { icon: Info, title: "Sobre", desc: "Nossa história", to: "/sobre" },
];

const QuickLinks = () => {
  return (
    <section className="relative z-10 -mt-16 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="glass-card rounded-xl p-6 text-center hover:bg-navy-light/80 transition-all group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <card.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{card.title}</h3>
              <p className="text-muted-foreground text-xs">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
