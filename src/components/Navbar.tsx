import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";
const Navbar = () => {
  const { pathname } = useLocation();
  const navLinks = [
    { to: "/", label: "Início" },
    { to: "/cultos", label: "Cultos" },
    { to: "/estudos", label: "Estudos Bíblicos" },
    { to: "/sobre", label: "Sobre" },
    { to: "/contato", label: "Contato" },
  ];

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
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "text-base font-medium transition-colors",
                pathname === to ? "text-gold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
          <button className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Nossa História <ChevronDown className="w-4 h-4" />
          </button>
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
