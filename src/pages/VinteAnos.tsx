import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Church, Heart, Users, Star, Calendar, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import pastorImg from "@/assets/pastor-20-anos.jpg";

const VinteAnos = () => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">

        {/* ===== BANNER 20 ANOS ===== */}
        <section className="relative w-full min-h-[520px] md:min-h-[600px] lg:min-h-[680px] overflow-hidden">
          {/* Background image */}
          <img
            src={pastorImg}
            alt="Pr. Rafael Delmônego — 20 Anos de Ministério"
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(218,48%,10%)]/90 via-[hsl(218,48%,10%)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(218,48%,10%)]/50 to-transparent" />

          {/* Top-left back link */}
          <div className="absolute top-20 left-0 right-0 z-20 px-4 sm:px-8">
            <div className="container mx-auto max-w-5xl">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors backdrop-blur-sm bg-white/10 rounded-full px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
            </div>
          </div>

          {/* Banner content — bottom-aligned */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 pb-10 md:pb-14 lg:pb-16">
            <div className="container mx-auto max-w-5xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary))]/20 border border-[hsl(var(--primary))]/40 backdrop-blur-md rounded-full px-4 py-1.5 mb-4 animate-fade-in-up">
                <Star className="w-4 h-4 text-[hsl(45,90%,65%)]" />
                <span className="text-sm font-semibold text-[hsl(45,90%,75%)]">Ebenézer — Até aqui nos ajudou o Senhor</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <span className="text-[hsl(45,90%,70%)]">20 Anos</span> de Ministério
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-light mb-2 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
                Pr. Rafael Delmônego
              </p>

              {/* Bible verse */}
              <p className="max-w-xl text-sm sm:text-base text-white/60 italic leading-relaxed mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                "Tive grande gozo e consolação do teu amor, porque por ti, ó irmão, o coração dos santos foi reanimado." — Filemom 1:7
              </p>

              {/* CTA — Cultos Especiais */}
              <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <Link
                  to="/sobre/20-anos/cultos-especiais"
                  className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-semibold rounded-full px-6 py-3 text-sm sm:text-base transition-all duration-300 shadow-lg shadow-[hsl(var(--primary))]/30"
                >
                  <Calendar className="w-4 h-4" />
                  Cultos Especiais
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/sobre/20-anos/fotos"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-medium rounded-full px-6 py-3 text-sm sm:text-base transition-all duration-300 border border-white/20"
                >
                  Galeria de Fotos
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CONTENT ===== */}
        <section className="px-4 py-16">
          <div className="container mx-auto max-w-3xl space-y-12">
            {/* Timeline intro */}
            <div className="animate-fade-in-up">
              <p className="text-lg text-[hsl(220,20%,30%)] leading-relaxed">
                Há 20 anos, o Tabernáculo O Filho do Homem iniciou sua jornada de fé. O que começou como um pequeno grupo de fiéis reunidos em oração,
                transformou-se em uma comunidade vibrante, dedicada a proclamar a Palavra de Deus e servir ao próximo.
              </p>
            </div>

            {/* Milestones */}
            <div className="space-y-8">
              <h2 className="text-2xl font-display font-bold text-[hsl(220,30%,20%)]">Marcos Importantes</h2>

              <div className="space-y-6">
                {[
                  {
                    icon: Church,
                    year: "Fundação",
                    title: "O Primeiro Culto",
                    description: "Com um pequeno grupo de irmãos, realizamos nosso primeiro culto, marcando o início de uma jornada de fé que se estenderia por décadas.",
                  },
                  {
                    icon: Users,
                    year: "Crescimento",
                    title: "Expansão da Comunidade",
                    description: "A congregação cresceu em número e espírito, acolhendo famílias inteiras que encontraram no Tabernáculo um lar espiritual.",
                  },
                  {
                    icon: Heart,
                    year: "Missão",
                    title: "Ações Sociais e Evangelização",
                    description: "Expandimos nosso alcance com programas de assistência social, levando a mensagem de Cristo para além das paredes da igreja.",
                  },
                  {
                    icon: Star,
                    year: "Presente",
                    title: "20 Anos de Fidelidade",
                    description: "Celebramos duas décadas de ministério com gratidão a Deus, olhando para o futuro com esperança e determinação renovadas.",
                  },
                ].map((milestone, index) => (
                  <div
                    key={index}
                    className="flex gap-5 p-6 rounded-2xl border border-[hsl(220,20%,92%)] hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] flex items-center justify-center">
                      <milestone.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wider">{milestone.year}</span>
                      <h3 className="font-display font-semibold text-[hsl(220,30%,20%)] text-lg mt-1">{milestone.title}</h3>
                      <p className="text-[hsl(220,15%,45%)] text-sm mt-2 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Closing message */}
            <div className="bg-[hsl(var(--primary)/0.06)] border-l-4 border-[hsl(var(--primary))] rounded-r-xl p-6">
              <p className="text-[hsl(220,20%,30%)] leading-relaxed italic">
                "Até aqui nos ajudou o Senhor." — 1 Samuel 7:12
              </p>
              <p className="text-sm text-[hsl(220,15%,50%)] mt-3">
                Agradecemos a Deus por cada vida transformada, cada família restaurada e cada momento de comunhão que vivemos juntos ao longo desses 20 anos.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default VinteAnos;
