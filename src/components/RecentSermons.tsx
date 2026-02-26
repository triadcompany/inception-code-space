import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const sermons = [
  {
    title: "Conscientes Que Deus é Poderoso Para Cumprir Tudo Que Prometeu",
    date: "25 de fevereiro de 2026",
    preacher: "Pr. Rafael Delmonego",
    thumb: "https://img.youtube.com/vi/rdrYztN9VOw/maxresdefault.jpg",
  },
  {
    title: "Sendo Despertado Pelo Anjo do Senhor Após a Sétima Era",
    date: "22 de fevereiro de 2026",
    preacher: "Pr. Rafael Delmonego",
    thumb: "https://img.youtube.com/vi/r5S4eVIZtEs/maxresdefault.jpg",
  },
  {
    title: "O Prumo na Mão de Zorobabel: Os Sete Olhos do Senhor",
    date: "21 de fevereiro de 2026",
    preacher: "Pr. Rafael Delmonego",
    thumb: "https://img.youtube.com/vi/x1C34squ0v0/maxresdefault.jpg",
  },
];

const RecentSermons = () => {
  return (
    <section className="py-16 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold text-sm font-medium tracking-wider uppercase mb-2">Cultos Recentes</p>
            <h2 className="text-3xl font-display font-bold text-foreground">Reviva os Momentos</h2>
            <p className="text-muted-foreground mt-2">Assista às mensagens mais recentes e alimente sua fé</p>
          </div>
          <Link
            to="/cultos"
            className="hidden md:inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm font-medium"
          >
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sermons.map((sermon, i) => (
            <Link
              key={i}
              to="/cultos"
              className="group bg-card rounded-xl overflow-hidden border border-border/30 hover:border-gold/30 transition-all"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={sermon.thumb}
                  alt={sermon.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">{sermon.title}</h3>
                <p className="text-muted-foreground text-xs">{sermon.date}</p>
                <p className="text-gold text-xs mt-1">Pregador: {sermon.preacher}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="md:hidden text-center mt-6">
          <Link
            to="/cultos"
            className="inline-flex items-center gap-2 text-gold text-sm font-medium"
          >
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentSermons;
