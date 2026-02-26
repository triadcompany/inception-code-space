const Footer = () => {
  return (
    <footer className="py-8 bg-navy-dark border-t border-border/20">
      <div className="container mx-auto px-4 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
          <span className="text-gold font-display text-sm font-bold">T</span>
        </div>
        <p className="font-display text-sm text-foreground mb-1">Tabernáculo O Filho do Homem</p>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
