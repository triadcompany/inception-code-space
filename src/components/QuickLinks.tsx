import { Video, BookOpen, Radio, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  { icon: Video, title: "Cultos", desc: "Gravações dos cultos", to: "/cultos" },
  { icon: BookOpen, title: "Estudos", desc: "Estudos bíblicos", to: "/estudos" },
  { icon: Radio, title: "Ao Vivo", desc: "Transmissão ao vivo", to: "/ao-vivo" },
  { icon: Users, title: "Sobre", desc: "Nossa história", to: "/sobre" },
];

const QuickLinks = () => {
  return (
    <section className="relative z-10 -mt-16 pt-0 pb-0 bg-transparent">
      <div className="absolute top-16 left-0 right-0 bottom-0 bg-foreground" />
      <div className="container mx-auto px-4 relative z-10 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="bg-foreground/95 rounded-xl p-10 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-md"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:bg-gold/15 transition-colors duration-300">
                <card.icon className="w-10 h-10 text-navy group-hover:text-gold transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-navy text-lg mb-1 group-hover:text-gold transition-colors duration-300">{card.title}</h3>
              <p className="text-navy/60 text-sm mb-2">{card.desc}</p>
              <ArrowRight className="w-4 h-4 mx-auto text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
