import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, ArrowUp } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Footer = () => {
  const { data: cfg } = useSiteConfig();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="py-8 bg-navy-dark border-t border-border/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <span className="font-display text-sm font-semibold text-foreground block leading-tight">
                  {cfg?.nome || "Tabernáculo"}
                </span>
                <span className="text-gold text-xs">{cfg?.subtitulo || "O Filho do Homem"}</span>
              </div>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {cfg?.descricao || "Uma comunidade de fé dedicada a proclamar a mensagem de Cristo e servir ao próximo com amor."}
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-gold font-semibold text-xs mb-3">Links Rápidos</h4>
            <ul className="space-y-1.5">
              <li><Link to="/" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Início</Link></li>
              <li><Link to="/cultos" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Cultos</Link></li>
              <li><Link to="/estudos" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Estudos Bíblicos</Link></li>
              <li><Link to="/sobre" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Sobre</Link></li>
              <li><Link to="/ao-vivo" className="text-muted-foreground text-xs hover:text-foreground transition-colors">Ao Vivo</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-gold font-semibold text-xs mb-3">Contato</h4>
            <ul className="space-y-2">
              {(cfg?.contato_endereco1 || cfg?.contato_endereco2) && (
                <li className="flex items-start gap-2 text-muted-foreground text-xs">
                  <MapPin className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" />
                  <span>{[cfg?.contato_endereco1, cfg?.contato_endereco2].filter(Boolean).join(", ")}</span>
                </li>
              )}
              {cfg?.contato_telefone && (
                <li className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Phone className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  {cfg.contato_telefone}
                </li>
              )}
              {cfg?.contato_email && (
                <li className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Mail className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  {cfg.contato_email}
                </li>
              )}
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="text-gold font-semibold text-xs mb-3">Redes Sociais</h4>
            <div className="flex items-center gap-2">
              <a href={cfg?.social_facebook || "#"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={cfg?.social_instagram || "#"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={cfg?.social_youtube || "#"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/20 pt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {cfg?.nome || "Tabernáculo"} {cfg?.subtitulo || "O Filho do Homem"}. Todos os direitos reservados.
          </p>
          <button
            onClick={scrollToTop}
            className="w-7 h-7 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
