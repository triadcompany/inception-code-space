import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";

// Pages with white/light backgrounds
const LIGHT_PAGES = ["/cultos", "/estudos", "/sobre", "/contato"];

const Navbar = () => {
  const { pathname } = useLocation();
  
  const isLightBg = LIGHT_PAGES.some(p => pathname.startsWith(p));

  const navLinks = [
    { to: "/", label: "Início" },
    { to: "/cultos", label: "Cultos" },
    { to: "/estudos", label: "Estudos Bíblicos" },
    { to: "/sobre", label: "Sobre" },
    { to: "/contato", label: "Contato" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-colors duration-300",
      isLightBg ? "bg-white/90 shadow-sm" : "bg-background/30"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-11 h-11 rounded-full object-cover" />
          <div className="-space-y-0.5">
            <span className={cn(
              "font-display text-base font-semibold block leading-tight",
              isLightBg ? "text-[hsl(220,30%,20%)]" : "text-foreground"
            )}>Tabernáculo</span>
            <span className="text-gold text-xs leading-tight block">O Filho do Homem</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "text-base font-medium transition-colors",
                  isActive
                    ? "text-gold"
                    : isLightBg
                      ? "text-[hsl(220,15%,40%)] hover:text-[hsl(220,30%,20%)]"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
          <button className={cn(
            "text-base font-medium transition-colors flex items-center gap-1",
            isLightBg
              ? "text-[hsl(220,15%,40%)] hover:text-[hsl(220,30%,20%)]"
              : "text-muted-foreground hover:text-foreground"
          )}>
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
