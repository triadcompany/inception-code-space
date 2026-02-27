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
    <section className="py-12 md:py-16 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-0.5 bg-gold rounded" />
              <p className="text-gold text-sm font-semibold tracking-widest uppercase">Cultos Recentes</p>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-navy">Reviva os Momentos</h2>
            <p className="text-navy/50 mt-1 md:mt-2 text-sm md:text-base">Assista às mensagens mais recentes e alimente sua fé</p>
          </div>
          <Link
            to="/cultos"
            className="hidden md:inline-flex items-center gap-2 border-2 border-gold text-gold px-5 py-2 rounded-full text-sm font-semibold hover:bg-gold hover:text-navy transition-colors"
          >
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {sermons.map((sermon, i) => (
            <Link
              key={i}
              to="/cultos"
              className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gold/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={sermon.thumb}
                  alt={sermon.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-navy text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">{sermon.title}</h3>
                <p className="text-navy/50 text-xs sm:text-sm">{sermon.date}</p>
                <p className="text-gold text-xs sm:text-sm mt-1">{sermon.preacher}</p>
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
