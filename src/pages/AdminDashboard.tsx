import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  Home,
  Video,
  BookOpen,
  FileText,
  Image,
  Calendar,
  Settings,
  ExternalLink,
  LogOut,
  ChevronLeft,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Home, label: "Dashboard", id: "dashboard" },
  { icon: Video, label: "Cultos", id: "cultos" },
  { icon: BookOpen, label: "Estudos Bíblicos", id: "estudos" },
  { icon: FileText, label: "Páginas", id: "paginas" },
  { icon: Image, label: "Galeria Fotos", id: "galeria" },
  { icon: Calendar, label: "Agenda", id: "agenda" },
  { icon: Settings, label: "Configurações", id: "config" },
];

const quickActions = [
  { icon: Video, label: "Novo Culto" },
  { icon: BookOpen, label: "Novo Estudo" },
  { icon: Calendar, label: "Editar Agenda" },
  { icon: ExternalLink, label: "Ver Site" },
];

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,96%)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[hsl(220,20%,96%)]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-60"
        } bg-white border-r border-[hsl(220,20%,90%)] flex flex-col transition-all duration-200`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-[hsl(220,20%,90%)]">
          {!sidebarCollapsed && (
            <div>
              <h2 className="font-bold text-[hsl(220,30%,20%)] text-sm">Painel Admin</h2>
              <p className="text-xs text-[hsl(220,15%,55%)]">Tabernáculo</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-[hsl(220,15%,55%)] hover:text-[hsl(220,30%,20%)]"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1">
          <p className={`text-[10px] uppercase text-[hsl(220,15%,55%)] px-3 py-2 ${sidebarCollapsed ? "hidden" : ""}`}>
            Menu
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeMenu === item.id
                  ? "bg-[hsl(218,45%,22%)] text-white"
                  : "text-[hsl(220,20%,40%)] hover:bg-[hsl(220,20%,93%)]"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}

          <p className={`text-[10px] uppercase text-[hsl(220,15%,55%)] px-3 py-2 mt-4 ${sidebarCollapsed ? "hidden" : ""}`}>
            Links
          </p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[hsl(220,20%,40%)] hover:bg-[hsl(220,20%,93%)]"
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Ver Site</span>}
          </a>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-[hsl(220,20%,90%)]">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Dashboard</h1>
          <p className="text-[hsl(220,15%,55%)] mb-8">Visão geral do conteúdo do site</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Video, label: "Cultos", count: 0, color: "hsl(218,45%,22%)" },
              { icon: BookOpen, label: "Estudos Bíblicos", count: 0, color: "hsl(218,45%,22%)" },
              { icon: Calendar, label: "Eventos na Agenda", count: 0, color: "hsl(var(--primary))" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 border border-[hsl(220,20%,90%)]"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: stat.color }}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm text-[hsl(220,15%,55%)]">{stat.label}</p>
                <p className="text-3xl font-bold text-[hsl(220,30%,20%)]">{stat.count}</p>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-[hsl(220,30%,20%)]">Cultos Recentes</h2>
                  <p className="text-xs text-[hsl(220,15%,55%)]">Últimos cultos adicionados</p>
                </div>
                <button className="text-sm text-[hsl(var(--primary))] hover:underline">
                  Ver todos →
                </button>
              </div>
              <p className="text-[hsl(220,15%,55%)] text-sm py-8 text-center">
                Nenhum culto cadastrado ainda.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-6">
              <h2 className="font-bold text-[hsl(220,30%,20%)]">Ações Rápidas</h2>
              <p className="text-xs text-[hsl(220,15%,55%)] mb-4">Acesse rapidamente</p>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[hsl(220,20%,90%)] hover:bg-[hsl(220,20%,96%)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="h-4 w-4 text-[hsl(220,15%,55%)]" />
                      <span className="text-sm text-[hsl(220,30%,20%)]">{action.label}</span>
                    </div>
                    <Plus className="h-4 w-4 text-[hsl(220,15%,55%)]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
