import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, LogIn, UserPlus } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useState, useEffect } from "react";

const LIGHT_PAGES = ["/cultos", "/estudos", "/doutrina", "/sobre", "/contato"];

const Navbar = () => {
  const { pathname } = useLocation();
  const { data: cfg } = useSiteConfig();
  const isLightBg = LIGHT_PAGES.some(p => pathname.startsWith(p));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { to: "/", label: "Início" },
    { to: "/cultos", label: "Cultos" },
    { to: "/estudos", label: "Estudos Bíblicos" },
    { to: "/doutrina", label: "Doutrina" },
    { to: "/sobre", label: "Sobre" },
    { to: "/contato", label: "Contato" },
  ];

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-colors duration-300",
        isLightBg ? "bg-white/90 shadow-sm" : "bg-background/30"
      )}>
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Logo" className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover" />
            <div className="-space-y-0.5">
              <span className={cn(
                "font-display text-sm md:text-base font-semibold block leading-tight",
                isLightBg ? "text-[hsl(220,30%,20%)]" : "text-foreground"
              )}>{cfg?.nome || "Tabernáculo"}</span>
              <span className="text-gold text-[11px] md:text-xs leading-tight block">{cfg?.subtitulo || "O Filho do Homem"}</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7">
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
                    <div className="max-h-0 overflow-hidden group-hover/sub:max-h-40 transition-all duration-200">
                      <Link to="/sobre/20-anos/fotos" className="block px-4 py-2.5 text-sm text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,97%)] hover:text-[hsl(var(--primary))] transition-colors pl-8">
                        Fotos
                      </Link>
                      <Link to="/sobre/20-anos/cultos-especiais" className="block px-4 py-2.5 text-sm text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,97%)] hover:text-[hsl(var(--primary))] transition-colors pl-8">
                        Cultos Especiais
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

          <div className="flex items-center gap-2">
            <Link
              to="/ao-vivo"
              className="hidden lg:flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-4 py-1.5 rounded-md text-[12px] md:text-[13px] font-semibold hover:bg-gold-light transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse-dot" />
              Ao Vivo
            </Link>
            <Link
              to="/admin/login"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] md:text-[13px] font-medium transition-colors border",
                isLightBg
                  ? "border-[hsl(220,20%,85%)] text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]"
                  : "border-white/20 text-foreground hover:bg-white/10"
              )}
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors",
                isLightBg ? "text-[hsl(220,30%,20%)] hover:bg-[hsl(220,20%,93%)]" : "text-foreground hover:bg-white/10"
              )}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[49] bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile menu drawer */}
      <div className={cn(
        "fixed top-0 right-0 bottom-0 w-72 z-[51] bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden flex flex-col",
        mobileOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-[hsl(220,20%,92%)]">
          <span className="font-display font-semibold text-[hsl(220,30%,20%)]">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[hsl(220,20%,93%)] text-[hsl(220,30%,20%)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                    : "text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]"
                )}
              >
                {label}
              </Link>
            );
          })}

          <div className="pt-2">
            <p className="px-4 py-2 text-[10px] uppercase text-[hsl(220,15%,55%)] font-semibold tracking-wider">Nossa História</p>
            <Link to="/sobre/20-anos" className="block px-4 py-3 rounded-lg text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(220,20%,96%)]">
              20 anos de ministério
            </Link>
            <Link to="/sobre/20-anos/fotos" className="block px-4 py-3 pl-8 rounded-lg text-sm text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]">
              Fotos
            </Link>
            <Link to="/sobre/20-anos/cultos-especiais" className="block px-4 py-3 pl-8 rounded-lg text-sm text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]">
              Cultos Especiais
            </Link>
            <Link to="/sobre/o-inicio" className="block px-4 py-3 rounded-lg text-sm text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]">
              O Início
            </Link>
          </div>

          <div className="pt-2 border-t border-[hsl(220,20%,92%)] mt-2 space-y-1">
            <Link to="/admin/login" className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]">
              <LogIn className="w-4 h-4" />
              Entrar
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
