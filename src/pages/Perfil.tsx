import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Camera, ArrowLeft, Save, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";

const Perfil = () => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
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
        setAvatarUrl(profile.avatar_url);
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
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("user_id", user.id);

      if (error) throw error;
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
      <div className="min-h-screen bg-[hsl(220,20%,96%)] pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-lg">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[hsl(220,15%,55%)] hover:text-[hsl(var(--primary))] text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            <h1 className="text-2xl font-bold text-[hsl(220,30%,20%)] text-center">Meu Perfil</h1>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-24 h-24 rounded-full overflow-hidden bg-[hsl(220,20%,90%)] cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[hsl(var(--primary))]">
                    {(displayName || user?.email || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-[hsl(220,15%,55%)]">
                {uploadingAvatar ? "Enviando..." : "Clique para alterar a foto"}
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">Nome</Label>
              <div className="flex gap-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)]"
                />
                <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="text-[hsl(220,30%,20%)]">E-mail</Label>
              <Input value={user?.email || ""} disabled className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,15%,55%)]" />
            </div>

            {/* Change Password */}
            <div className="space-y-3 border-t border-[hsl(220,20%,92%)] pt-6">
              <h2 className="text-lg font-semibold text-[hsl(220,30%,20%)]">Alterar Senha</h2>
              <div className="space-y-2">
                <Label className="text-[hsl(220,30%,20%)]">Nova senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,15%,55%)]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(220,30%,20%)]">Confirmar nova senha</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="bg-[hsl(220,20%,96%)] border-[hsl(220,20%,90%)] text-[hsl(220,30%,20%)]"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={saving || !newPassword || !confirmPassword}
                className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(38,80%,48%)] text-white"
              >
                Alterar senha
              </Button>
            </div>

            {/* Sign out */}
            <div className="border-t border-[hsl(220,20%,92%)] pt-6">
              <Button onClick={handleSignOut} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" /> Sair da conta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;
