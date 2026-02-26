import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, ArrowUp } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="py-14 bg-navy-dark border-t border-border/20">
      <div className="container mx-auto px-4">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <span className="font-display text-sm font-semibold text-foreground block leading-tight">Tabernáculo</span>
                <span className="text-gold text-xs">O Filho do Homem</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Uma comunidade de fé dedicada a proclamar a mensagem de Cristo e servir ao próximo com amor.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-gold font-semibold text-sm mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Início</Link></li>
              <li><Link to="/cultos" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Cultos</Link></li>
              <li><Link to="/estudos" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Estudos Bíblicos</Link></li>
              <li><Link to="/sobre" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Sobre</Link></li>
              <li><Link to="/ao-vivo" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Ao Vivo</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-gold font-semibold text-sm mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                R. Guilherme Bauer, 403, Schroeder/SC.
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                (47) 98810-3818
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                contato@tabernaculoofh.com
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="text-gold font-semibold text-sm mb-4">Redes Sociais</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/20 pt-6 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Tabernáculo O Filho do Homem. Todos os direitos reservados.
          </p>
          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
