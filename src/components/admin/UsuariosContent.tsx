import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Users, Clock, UserCheck, Trash2 } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  approved: boolean;
  created_at: string;
}

const UsuariosContent = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, approved, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar os usuários.", variant: "destructive" });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ approved: true })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível aprovar o usuário.", variant: "destructive" });
    } else {
      toast({ title: "Aprovado!", description: "O usuário foi aprovado com sucesso." });
      fetchUsers();
    }
    setActionLoading(null);
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ approved: false })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível rejeitar o usuário.", variant: "destructive" });
    } else {
      toast({ title: "Rejeitado", description: "O acesso do usuário foi removido." });
      fetchUsers();
    }
    setActionLoading(null);
  };

  const pendingUsers = users.filter(u => !u.approved);
  const approvedUsers = users.filter(u => u.approved);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Usuários</h1>
        <p className="text-[hsl(220,15%,55%)]">Gerencie os usuários e aprovações de acesso</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-[hsl(var(--primary))]" />
          <div>
            <p className="text-2xl font-bold text-[hsl(220,30%,20%)]">{users.length}</p>
            <p className="text-xs text-[hsl(220,15%,55%)]">Total de usuários</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-4 flex items-center gap-3">
          <Clock className="h-8 w-8 text-amber-500" />
          <div>
            <p className="text-2xl font-bold text-[hsl(220,30%,20%)]">{pendingUsers.length}</p>
            <p className="text-xs text-[hsl(220,15%,55%)]">Aguardando aprovação</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-4 flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-2xl font-bold text-[hsl(220,30%,20%)]">{approvedUsers.length}</p>
            <p className="text-xs text-[hsl(220,15%,55%)]">Aprovados</p>
          </div>
        </div>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[hsl(220,30%,20%)] mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Aguardando aprovação ({pendingUsers.length})
          </h2>
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data de registro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.display_name || "Sem nome"}</TableCell>
                    <TableCell className="text-[hsl(220,15%,55%)]">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(user.user_id)}
                        disabled={actionLoading === user.user_id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* All Users */}
      <div>
        <h2 className="text-lg font-semibold text-[hsl(220,30%,20%)] mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-[hsl(var(--primary))]" />
          Todos os usuários ({users.length})
        </h2>
        <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-[hsl(220,15%,55%)]">Nenhum usuário cadastrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de registro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-[hsl(220,30%,20%)]">{user.display_name || "Sem nome"}</TableCell>
                    <TableCell>
                      {user.approved ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aprovado</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-[hsl(220,15%,55%)]">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {user.approved ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(user.user_id)}
                          disabled={actionLoading === user.user_id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Revogar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user.user_id)}
                          disabled={actionLoading === user.user_id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuariosContent;
