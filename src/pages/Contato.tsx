import { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contato = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-10 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Contato
          </h1>
          <p className="text-muted-foreground text-sm">
            Entre em contato conosco
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-4xl grid md:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-foreground text-sm font-semibold">Endereço</p>
                <p className="text-muted-foreground text-sm">R. Guilherme Bauer, 403, Schroeder/SC.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-foreground text-sm font-semibold">Telefone</p>
                <p className="text-muted-foreground text-sm">(47) 98810-3818</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-foreground text-sm font-semibold">E-mail</p>
                <p className="text-muted-foreground text-sm">contato@tabernaculofilhodohomem.com</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="bg-card rounded-xl border border-border p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-background text-foreground border border-border rounded-md px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background text-foreground border border-border rounded-md px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              placeholder="Sua mensagem"
              rows={4}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full bg-background text-foreground border border-border rounded-md px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-accent transition-colors"
            >
              <Send className="w-4 h-4" />
              Enviar Mensagem
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contato;
