import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-11 h-11 rounded-full object-cover" />
          <div className="-space-y-0.5">
            <span className="font-display text-base font-semibold text-foreground block leading-tight">Tabernáculo</span>
            <span className="text-gold text-xs leading-tight block">O Filho do Homem</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <Link to="/" className="text-base font-medium text-gold">Início</Link>
          <Link to="/cultos" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">Cultos</Link>
          <Link to="/estudos" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">Estudos Bíblicos</Link>
          <button className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Nossa História <ChevronDown className="w-4 h-4" />
          </button>
          <Link to="/sobre" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">Sobre</Link>
          <Link to="/contato" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors">Contato</Link>
        </div>

        <Link
          to="/ao-vivo"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-[13px] font-semibold hover:bg-gold-light transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse-dot" />
          Ao Vivo
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
