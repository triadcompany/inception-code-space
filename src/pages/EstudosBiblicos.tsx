import { User, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const EstudosBiblicos = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-10 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Estudos Bíblicos
          </h1>
          <p className="text-muted-foreground text-sm">
            Aprofunde seu conhecimento nas Escrituras com nossos estudos e reflexões
          </p>
        </div>
      </section>

      {/* Studies list */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-3xl space-y-4">
          <p className="text-muted-foreground text-sm text-center py-16">
            Nenhum estudo encontrado.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EstudosBiblicos;
