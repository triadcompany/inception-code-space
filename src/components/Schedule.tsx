import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const schedule = [
  { name: "Culto", day: "DOM", time: "17:00" },
  { name: "Culto", day: "SAB", time: "18:00" },
  { name: "Culto de Oração", day: "QUA", time: "19:30" },
];

const Schedule = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-gold text-sm font-medium tracking-wider uppercase mb-2">Programação</p>
          <h2 className="text-3xl font-display font-bold text-foreground mb-3">Horário dos Cultos</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Confira nossos horários e venha participar de nossos encontros.
          </p>
        </div>

        <div className="max-w-lg mx-auto space-y-3 mb-8">
          {schedule.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-card rounded-xl p-4 border border-border/30"
            >
              <span className="text-foreground font-medium">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gold font-bold text-sm">{item.day}</span>
                <span className="text-muted-foreground text-sm">{item.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/contato"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm font-medium"
          >
            <MapPin className="w-4 h-4" />
            Como Chegar
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
