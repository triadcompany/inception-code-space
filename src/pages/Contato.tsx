import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contato = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header - azul (background) */}
      <section className="pt-28 pb-10 px-4 text-center bg-background">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Contato
          </h1>
          <p className="text-muted-foreground text-sm">
            Entre em contato conosco. Será uma alegria recebê-lo!
          </p>
        </div>
      </section>

      {/* Content - branco */}
      <section className="px-4 py-16 bg-white">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            {/* Endereço */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm font-semibold mb-1">Endereço</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  R. Guilherme Bauer, 403<br />
                  Bairro Centro<br />
                  Schroeder/SC
                </p>
              </div>
            </div>

            {/* Telefone */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
              <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm font-semibold mb-1">Telefone</p>
                <p className="text-gray-600 text-sm">(47) 98810-3818</p>
              </div>
            </div>

            {/* E-mail */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
              <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm font-semibold mb-1">E-mail</p>
                <p className="text-gray-600 text-sm">contato@tabernaculo.com</p>
              </div>
            </div>

            {/* Horários */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4">
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-900 text-sm font-semibold mb-1">Horários dos Cultos</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Domingo: 09h e 19h<br />
                  Quarta-feira: 19h30<br />
                  Sexta-feira: 20h
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/5547988103818"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground w-full py-3 rounded-xl text-sm font-semibold hover:bg-accent transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Fale Conosco pelo WhatsApp
            </a>
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-border h-full min-h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.0!2d-49.0734!3d-26.4153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDI0JzU1LjEiUyA0OcKwMDQnMjQuMiJX!5e0!3m2!1spt-BR!2sbr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização do Tabernáculo"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contato;
