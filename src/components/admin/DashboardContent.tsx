import { Video, BookOpen, Calendar, Plus } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

interface DashboardContentProps {
  onNavigate: (id: string) => void;
}

const DashboardContent = ({ onNavigate }: DashboardContentProps) => {
  return (
    <>
      <AnimatedSection>
        <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(220,30%,20%)]">Dashboard</h1>
        <p className="text-[hsl(220,15%,55%)] mb-8">Visão geral do conteúdo do site</p>
      </AnimatedSection>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Video, label: "Cultos", count: 0, color: "hsl(218,45%,22%)" },
          { icon: BookOpen, label: "Estudos Bíblicos", count: 0, color: "hsl(218,45%,22%)" },
          { icon: Calendar, label: "Eventos na Agenda", count: 0, color: "hsl(var(--primary))" },
        ].map((stat, i) => (
          <AnimatedSection key={stat.label} delay={100 + i * 80}>
            <div className="bg-white rounded-xl p-6 border border-[hsl(220,20%,90%)] hover:shadow-md hover:border-[hsl(220,20%,82%)] hover:-translate-y-0.5 transition-all duration-300 group">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm text-[hsl(220,15%,55%)]">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[hsl(220,30%,20%)]">{stat.count}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnimatedSection delay={380} className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 hover:shadow-sm transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-[hsl(220,30%,20%)]">Cultos Recentes</h2>
                <p className="text-xs text-[hsl(220,15%,55%)]">Últimos cultos adicionados</p>
              </div>
              <button onClick={() => onNavigate("cultos")} className="text-sm text-[hsl(var(--primary))] hover:underline transition-colors">
                Ver todos →
              </button>
            </div>
            <p className="text-[hsl(220,15%,55%)] text-sm py-8 text-center">Nenhum culto cadastrado ainda.</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={460}>
          <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6 hover:shadow-sm transition-shadow duration-300">
            <h2 className="font-bold text-[hsl(220,30%,20%)]">Ações Rápidas</h2>
            <p className="text-xs text-[hsl(220,15%,55%)] mb-4">Acesse rapidamente</p>
            <div className="space-y-2">
              {[
                { icon: Video, label: "Novo Culto", action: "cultos" },
                { icon: BookOpen, label: "Novo Estudo", action: "estudos" },
                { icon: Calendar, label: "Editar Agenda", action: "agenda" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.action)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[hsl(220,20%,90%)] hover:bg-[hsl(220,20%,96%)] hover:border-[hsl(220,20%,82%)] hover:shadow-sm active:scale-[0.98] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-[hsl(220,15%,55%)]" />
                    <span className="text-sm text-[hsl(220,30%,20%)]">{item.label}</span>
                  </div>
                  <Plus className="h-4 w-4 text-[hsl(220,15%,55%)]" />
                </button>
              ))}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[hsl(220,20%,90%)] hover:bg-[hsl(220,20%,96%)] hover:border-[hsl(220,20%,82%)] hover:shadow-sm active:scale-[0.98] transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[hsl(220,30%,20%)]">Ver Site</span>
                </div>
                <Plus className="h-4 w-4 text-[hsl(220,15%,55%)]" />
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default DashboardContent;
