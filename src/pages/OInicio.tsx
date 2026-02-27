import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Flame, MapPin, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OInicio = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-10 left-20 w-80 h-80 bg-[hsl(var(--primary))] rounded-full blur-[130px]" />
          </div>
          <div className="container mx-auto max-w-3xl px-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[hsl(215,20%,70%)] hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)] rounded-full px-3 py-1 mb-4">
              <BookOpen className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              <span className="text-xs font-medium text-[hsl(var(--primary))]">Nossa História</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight animate-fade-in-up">
              O Início
            </h1>
            <p className="text-[hsl(215,20%,75%)] text-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Como tudo começou — a semente que Deus plantou
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 py-16">
          <div className="container mx-auto max-w-3xl space-y-10">
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-display font-bold text-[hsl(220,30%,20%)] mb-4">A Semente da Fé</h2>
              <p className="text-lg text-[hsl(220,20%,30%)] leading-relaxed">
                A história do Tabernáculo O Filho do Homem começa com um chamado divino. Um grupo de irmãos, movidos pelo Espírito Santo, 
                sentiu a necessidade de se reunir para adorar a Deus de maneira simples e verdadeira, fundamentada na Palavra.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              {[
                {
                  icon: Flame,
                  title: "O Chamado",
                  text: "Tudo começou com reuniões de oração em uma pequena sala, onde a presença de Deus se manifestava de forma poderosa entre os irmãos.",
                },
                {
                  icon: MapPin,
                  title: "O Lugar",
                  text: "Em Schroeder/SC, na Rua Guilherme Bauer, encontramos o local que Deus havia preparado para estabelecer Sua obra.",
                },
                {
                  icon: BookOpen,
                  title: "A Palavra",
                  text: "Desde o início, o compromisso com a pregação fiel da Palavra de Deus foi o alicerce sobre o qual construímos nossa comunidade.",
                },
                {
                  icon: Star,
                  title: "A Visão",
                  text: "Levar a mensagem de Cristo a cada coração, formando discípulos comprometidos com o evangelho e com o serviço ao próximo.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl border border-[hsl(220,20%,92%)] hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                  </div>
                  <h3 className="font-display font-semibold text-[hsl(220,30%,20%)] text-lg">{item.title}</h3>
                  <p className="text-sm text-[hsl(220,15%,45%)] mt-2 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-2xl font-display font-bold text-[hsl(220,30%,20%)] mb-4">Os Primeiros Passos</h2>
              <p className="text-[hsl(220,20%,30%)] leading-relaxed">
                Com fé e determinação, os primeiros membros enfrentaram desafios e dificuldades, mas nunca perderam de vista o propósito 
                ao qual foram chamados. Cada obstáculo foi superado pela graça de Deus, e cada vitória celebrada com gratidão.
              </p>
              <p className="text-[hsl(220,20%,30%)] leading-relaxed mt-4">
                A igreja cresceu não apenas em número, mas em maturidade espiritual, tornando-se um farol de esperança 
                na comunidade de Schroeder e região.
              </p>
            </div>

            {/* Quote */}
            <div className="bg-[hsl(var(--primary)/0.06)] border-l-4 border-[hsl(var(--primary))] rounded-r-xl p-6">
              <p className="text-[hsl(220,20%,30%)] leading-relaxed italic">
                "Porque ninguém pode pôr outro fundamento, além do que já está posto, o qual é Jesus Cristo." — 1 Coríntios 3:11
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OInicio;
