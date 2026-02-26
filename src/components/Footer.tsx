import logo from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="py-8 bg-navy-dark border-t border-border/20">
      <div className="container mx-auto px-4 text-center">
        <img src={logo} alt="Logo" className="w-12 h-12 mx-auto mb-3 rounded-full object-cover" />
        <p className="font-display text-sm text-foreground mb-1">Tabernáculo O Filho do Homem</p>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
