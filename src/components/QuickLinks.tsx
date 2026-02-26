import { Video, BookOpen, Radio, Users } from "lucide-react";
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.to}
              className="bg-foreground/95 rounded-xl p-8 text-center hover:shadow-lg transition-all group shadow-md"
            >
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <card.icon className="w-10 h-10 text-navy" />
              </div>
              <h3 className="font-semibold text-navy text-lg mb-1">{card.title}</h3>
              <p className="text-navy/60 text-sm">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
