import { Link } from "react-router-dom";
import { ArrowLeft, Church, Heart, Users, Star, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VinteAnos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(218,48%,14%)] via-[hsl(218,45%,18%)] to-[hsl(218,40%,24%)]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-72 h-72 bg-[hsl(var(--primary))] rounded-full blur-[120px]" />
          </div>
          <div className="container mx-auto max-w-3xl px-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[hsl(215,20%,70%)] hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)] rounded-full px-3 py-1 mb-4">
              <Star className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              <span className="text-xs font-medium text-[hsl(var(--primary))]">Nossa História</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight animate-fade-in-up">
              20 Anos de Ministério
            </h1>
            <p className="text-[hsl(215,20%,75%)] text-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Duas décadas de fé, dedicação e serviço ao Senhor
            </p>
          </div>
        </section>

        {/* Content */}
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
