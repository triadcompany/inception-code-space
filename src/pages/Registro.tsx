import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Registro = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 6) {
      toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: name.trim() },
        },
      });

      if (error) throw error;

      // Sign out immediately since user needs approval
      await supabase.auth.signOut();
      setSuccess(true);
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message === "User already registered"
          ? "Este e-mail já está registrado."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,96%)]">
        <div className="w-full max-w-md mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[hsl(220,30%,20%)] mb-2">Conta criada!</h1>
            <p className="text-[hsl(220,15%,55%)] mb-6">
              Sua conta foi criada com sucesso. Um administrador precisa aprovar seu acesso antes que você possa entrar.
            </p>
            <Button onClick={() => navigate("/admin/login")} variant="outline" className="w-full">
              Ir para o login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,96%)]">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white font-bold text-xl mb-4">
              T
            </div>
            <h1 className="text-2xl font-bold text-[hsl(220,30%,20%)]">Criar Conta</h1>
            <p className="text-[hsl(220,15%,55%)] mt-1 text-center">
              Após o registro, um administrador precisará aprovar sua conta.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[hsl(220,30%,20%)]">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] placeholder:text-[hsl(220,15%,65%)] focus:border-[hsl(var(--primary))]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[hsl(220,30%,20%)]">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] placeholder:text-[hsl(220,15%,65%)] focus:border-[hsl(var(--primary))]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[hsl(220,30%,20%)]">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] placeholder:text-[hsl(220,15%,65%)] focus:border-[hsl(var(--primary))] pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,15%,55%)] hover:text-[hsl(220,30%,30%)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white font-semibold py-3 text-base"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => navigate("/admin/login")}
              className="text-[hsl(var(--primary))] hover:underline text-sm"
            >
              Já tem uma conta? Faça login
            </button>
            <br />
            <button
              onClick={() => navigate("/")}
              className="text-[hsl(220,15%,55%)] hover:text-[hsl(var(--primary))] text-sm"
            >
              ← Voltar ao site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
