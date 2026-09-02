import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const { data: user, error } = await login(email, password);
      if (error || !user) throw new Error(error?.message ?? "Erro ao entrar");

      if (!user.approved) {
        await logout();
        toast({
          title: "Conta pendente",
          description: "Sua conta ainda não foi aprovada por um administrador.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Login realizado com sucesso!" });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,96%)]">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white font-bold text-xl mb-4">
              T
            </div>
            <h1 className="text-2xl font-bold text-[hsl(220,30%,20%)]">Entrar</h1>
            <p className="text-[hsl(220,15%,55%)] mt-1 text-center">
              Acesse sua conta de membro
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] placeholder:text-[hsl(220,15%,65%)] focus:border-[hsl(var(--primary))] pr-10"
                  required
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
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => navigate("/registro")}
              className="text-[hsl(var(--primary))] hover:underline text-sm"
            >
              Não tem conta? Crie uma agora
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

export default Login;
