import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Camera, ArrowLeft, Check, LogOut, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Progress } from "@/components/ui/progress";

const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 20, label: "Fraca", color: "bg-red-500" };
  if (score <= 2) return { score: 40, label: "Razoável", color: "bg-orange-500" };
  if (score <= 3) return { score: 60, label: "Boa", color: "bg-yellow-500" };
  if (score <= 4) return { score: 80, label: "Forte", color: "bg-green-500" };
  return { score: 100, label: "Muito forte", color: "bg-emerald-500" };
};

const Perfil = () => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const nameChanged = displayName.trim() !== originalName;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/login");
          return;
        }
        setUser(session.user);

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profile) {
          setDisplayName(profile.display_name || "");
          setOriginalName(profile.display_name || "");
          setAvatarUrl(profile.avatar_url);
        }
      } catch (error: any) {
        toast({ title: "Erro ao carregar perfil", description: error.message, variant: "destructive" });
      }
      setLoading(false);
    };
    loadProfile();
  }, [navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Erro", description: "Selecione uma imagem válida.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const url = `${publicUrl}?t=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id);

      setAvatarUrl(url);
      toast({ title: "Foto atualizada!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!user || !nameChanged) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("user_id", user.id);

      if (error) throw error;
      setOriginalName(displayName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
      toast({ title: "Nome atualizado!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Senha muito curta", description: "Mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Senhas não conferem", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Senha alterada com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,96%)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[hsl(220,20%,96%)] pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-md sm:max-w-lg md:max-w-xl">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-[hsl(220,15%,55%)] hover:text-[hsl(var(--primary))] text-sm mb-4 sm:mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-[hsl(220,30%,20%)] to-[hsl(220,25%,30%)] px-4 sm:px-8 pt-6 sm:pt-8 pb-14 sm:pb-16 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Meu Perfil</h1>
            </div>

            {/* Avatar overlapping header */}
            <div className="flex flex-col items-center -mt-10 sm:-mt-12 mb-4 sm:mb-6">
              <div
                className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white border-[3px] sm:border-4 border-white shadow-lg cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Alterar foto de perfil"
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl sm:text-4xl font-bold bg-[hsl(220,20%,92%)] text-[hsl(var(--primary))]">
                    {(displayName || user?.email || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-200">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white mb-0.5 sm:mb-1" />
                  <span className="text-[9px] sm:text-[10px] text-white font-medium">Alterar</span>
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[hsl(var(--primary))]" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-[11px] sm:text-xs text-[hsl(220,15%,60%)] mt-1.5 sm:mt-2">
                Toque na foto para alterar
              </p>
            </div>

            <div className="px-4 sm:px-8 pb-6 sm:pb-8 space-y-5 sm:space-y-6">
              {/* Name */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[hsl(220,30%,20%)] font-semibold text-xs sm:text-sm">Nome</Label>
                <div className="flex gap-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-[hsl(220,20%,97%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))] transition-colors text-sm sm:text-base"
                    onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                  />
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving || !nameChanged}
                    size="default"
                    className={`px-3 sm:px-4 shrink-0 transition-all duration-200 text-sm ${
                      nameSaved
                        ? "bg-green-600 hover:bg-green-600"
                        : "bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)]"
                    } text-white`}
                  >
                    {nameSaved ? <Check className="w-4 h-4" /> : "Salvar"}
                  </Button>
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-[hsl(220,30%,20%)] font-semibold text-xs sm:text-sm">E-mail</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-[hsl(220,20%,97%)] border-[hsl(220,20%,90%)] text-[hsl(220,15%,55%)] cursor-not-allowed text-sm sm:text-base"
                />
              </div>

              {/* Change Password */}
              <div className="space-y-3 sm:space-y-4 border-t border-[hsl(220,20%,92%)] pt-5 sm:pt-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--primary))]" />
                  <h2 className="text-base sm:text-lg font-bold text-[hsl(220,30%,20%)]">Alterar Senha</h2>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[hsl(220,30%,20%)] font-semibold text-xs sm:text-sm">Nova senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="bg-[hsl(220,20%,97%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] pr-10 focus:border-[hsl(var(--primary))] transition-colors text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,15%,55%)] hover:text-[hsl(220,30%,30%)] transition-colors"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="space-y-1 sm:space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="h-1 sm:h-1.5 rounded-full bg-[hsl(220,20%,92%)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {passwordStrength.score <= 40 ? (
                          <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                        ) : (
                          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                        )}
                        <span className="text-[11px] sm:text-xs text-[hsl(220,15%,55%)]">
                          Força: <strong>{passwordStrength.label}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[hsl(220,30%,20%)] font-semibold text-xs sm:text-sm">Confirmar nova senha</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="bg-[hsl(220,20%,97%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] focus:border-[hsl(var(--primary))] transition-colors text-sm sm:text-base"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[11px] sm:text-xs text-red-500 animate-in fade-in duration-200">As senhas não conferem</p>
                  )}
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={saving || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white font-semibold py-2 sm:py-2.5 text-sm sm:text-base transition-colors disabled:opacity-50"
                >
                  Alterar senha
                </Button>
              </div>

              {/* Sign out */}
              <div className="border-t border-[hsl(220,20%,92%)] pt-5 sm:pt-6">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-semibold transition-colors text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sair da conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;
