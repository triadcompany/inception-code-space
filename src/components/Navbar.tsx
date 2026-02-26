import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/80 backdrop-blur-md border-b border-border/20">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
            <span className="text-gold font-display text-sm font-bold">T</span>
          </div>
          <div>
            <span className="font-display text-sm font-semibold text-foreground block leading-tight">Tabernáculo</span>
            <span className="text-gold text-xs">O Filho do Homem</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-foreground border-b-2 border-gold pb-0.5">Início</Link>
          <Link to="/cultos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cultos</Link>
          <Link to="/estudos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Estudos Bíblicos</Link>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Nossa História <ChevronDown className="w-3 h-3" />
          </button>
          <Link to="/sobre" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sobre</Link>
          <Link to="/contato" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contato</Link>
        </div>

        <Link
          to="/ao-vivo"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse-dot" />
          Ao Vivo
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
