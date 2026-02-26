import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight } from "lucide-react";

const schedule = [
  { name: "Culto", day: "DOM", time: "17:00" },
  { name: "Culto", day: "SAB", time: "18:00" },
  { name: "Culto de Oração", day: "QUA", time: "19:30" },
];

const Schedule = () => {
  return (
    <section className="py-20 bg-navy-dark">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Left side - Title and CTA */}
          <div className="md:w-2/5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-0.5 bg-gold rounded" />
              <p className="text-gold text-sm font-semibold tracking-widest uppercase">Programação</p>
            </div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">Horário dos Cultos</h2>
            <p className="text-muted-foreground mb-8">
              Confira nossos horários e venha participar de nossos encontros.
            </p>
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 border-2 border-gold text-gold px-6 py-3 rounded-full text-sm font-semibold hover:bg-gold hover:text-navy transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Como Chegar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right side - Schedule cards grid */}
          <div className="md:w-3/5 flex flex-col gap-4">
            {schedule.map((item, i) => (
              <div
                key={i}
                className="bg-secondary/60 rounded-xl p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-lg">{item.day}  •  {item.time}</p>
                  <p className="text-muted-foreground text-sm">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
