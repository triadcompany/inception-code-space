import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContatoConfig } from "@/hooks/useSiteConfig";

const Contato = () => {
  const { data: cfg } = useContatoConfig();

  const enderecoLines = (cfg?.endereco || "").split("\n").filter(Boolean);
  const telefoneLines = (cfg?.telefones || "").split("\n").filter(Boolean);
  const horarioLines = (cfg?.horarios || "").split("\n").filter(Boolean);
  const whatsappLink = cfg?.whatsapp ? `https://wa.me/${cfg.whatsapp}` : "#";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="pt-28 pb-10 px-4 text-center">
          <div className="container mx-auto max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Contato</h1>
            <p className="text-muted-foreground text-sm">Entre em contato conosco. Será uma alegria recebê-lo!</p>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {/* Endereço */}
              {enderecoLines.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-foreground text-sm font-semibold mb-1">Endereço</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {enderecoLines.map((line, i) => <span key={i}>{line}{i < enderecoLines.length - 1 && <br />}</span>)}
                    </p>
                  </div>
                </div>
              )}

              {/* Telefone */}
              {telefoneLines.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 flex items-start gap-4">
                  <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-foreground text-sm font-semibold mb-1">Telefone</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {telefoneLines.map((line, i) => <span key={i}>{line}{i < telefoneLines.length - 1 && <br />}</span>)}
                    </p>
                  </div>
                </div>
              )}

              {/* E-mail */}
              {cfg?.email && (
                <div className="bg-card rounded-xl border border-border p-6 flex items-start gap-4">
                  <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-foreground text-sm font-semibold mb-1">E-mail</p>
                    <p className="text-muted-foreground text-sm">{cfg.email}</p>
                  </div>
                </div>
              )}

              {/* Horários */}
              {horarioLines.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6 flex items-start gap-4">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-foreground text-sm font-semibold mb-1">Horários dos Cultos</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {horarioLines.map((line, i) => <span key={i}>{line}{i < horarioLines.length - 1 && <br />}</span>)}
                    </p>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {cfg?.whatsapp && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground w-full py-3 rounded-xl text-sm font-semibold hover:bg-accent transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Fale Conosco pelo WhatsApp
                </a>
              )}
            </div>

            {/* Map */}
            {cfg?.mapa_url && (
              <div className="rounded-xl overflow-hidden border border-border h-full min-h-[400px]">
                <iframe
                  src={cfg.mapa_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização do Tabernáculo"
                />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contato;
