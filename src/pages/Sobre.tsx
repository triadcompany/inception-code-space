import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Sobre = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-10 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Sobre
          </h1>
          <p className="text-muted-foreground text-sm">
            Conheça mais sobre o Tabernáculo O Filho do Homem
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-card rounded-xl border border-border p-8 space-y-6">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Nossa Missão</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Somos uma comunidade de fé dedicada a proclamar a mensagem de Cristo e servir ao próximo com amor.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">Nossa História</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O Tabernáculo O Filho do Homem nasceu do desejo de compartilhar a Palavra de Deus de forma fiel e acessível a todos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sobre;
