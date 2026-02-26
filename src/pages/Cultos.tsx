import { useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Cultos = () => {
  const [pregador, setPregador] = useState("todos");
  const [ano, setAno] = useState("todos");
  const [busca, setBusca] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Cultos
          </h1>
          <p className="text-muted-foreground text-sm">
            Assista aos cultos e pregações do Tabernáculo O Filho do Homem.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-10">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row gap-3">
          {/* Pregador */}
          <select
            value={pregador}
            onChange={(e) => setPregador(e.target.value)}
            className="bg-card text-foreground border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Pregador: Todos</option>
          </select>

          {/* Ano */}
          <select
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="bg-card text-foreground border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Ano: Todos</option>
          </select>

          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por título..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-card text-foreground border border-border rounded-md pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </section>

      {/* Empty state */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-5xl text-center py-16">
          <p className="text-muted-foreground text-sm">
            Nenhum culto encontrado.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cultos;
