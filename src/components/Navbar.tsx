import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const LIGHT_PAGES = ["/cultos", "/estudos", "/sobre", "/contato"];

const Navbar = () => {
  const { pathname } = useLocation();
  const { data: cfg } = useSiteConfig();
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
            )}>{cfg?.nome || "Tabernáculo"}</span>
            <span className="text-gold text-xs leading-tight block">{cfg?.subtitulo || "O Filho do Homem"}</span>
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
          <div className="relative group">
            <button className={cn(
              "text-base font-medium transition-colors flex items-center gap-1",
              isLightBg
                ? "text-[hsl(220,15%,40%)] hover:text-[hsl(220,30%,20%)]"
                : "text-muted-foreground hover:text-foreground"
            )}>
              Nossa História <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-white rounded-xl shadow-lg border border-[hsl(220,20%,92%)] py-2 min-w-[220px]">
                <div className="group/sub relative">
                  <Link to="/sobre/20-anos" className="flex items-center justify-between px-4 py-2.5 text-sm text-[hsl(var(--primary))] font-medium hover:bg-[hsl(220,20%,97%)] transition-colors">
                    20 anos de ministério
                  </Link>
                  <div className="max-h-0 overflow-hidden group-hover/sub:max-h-20 transition-all duration-200">
                    <Link to="/sobre/20-anos/fotos" className="block px-4 py-2.5 text-sm text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,97%)] hover:text-[hsl(var(--primary))] transition-colors pl-8">
                      Fotos
                    </Link>
                  </div>
                </div>
                <Link to="/sobre/o-inicio" className="block px-4 py-2.5 text-sm text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,97%)] hover:text-[hsl(var(--primary))] transition-colors">
                  O Início
                </Link>
              </div>
            </div>
          </div>
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
