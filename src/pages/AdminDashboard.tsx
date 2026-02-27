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
} from "lucide-react";
import { useState } from "react";
import DashboardContent from "@/components/admin/DashboardContent";
import AdminPageShell from "@/components/admin/AdminPageShell";
import CultosContent from "@/components/admin/CultosContent";
import EstudosContent from "@/components/admin/EstudosContent";
import GaleriaContent from "@/components/admin/GaleriaContent";

const menuItems = [
  { icon: Home, label: "Dashboard", id: "dashboard" },
  { icon: Video, label: "Cultos", id: "cultos" },
  { icon: BookOpen, label: "Estudos Bíblicos", id: "estudos" },
  { icon: FileText, label: "Páginas", id: "paginas" },
  { icon: Image, label: "Galeria Fotos", id: "galeria" },
  { icon: Calendar, label: "Agenda", id: "agenda" },
  { icon: Settings, label: "Configurações", id: "config" },
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

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent onNavigate={setActiveMenu} />;
      case "cultos":
        return <CultosContent />;
      case "estudos":
        return <EstudosContent />;
      case "paginas":
        return (
          <AdminPageShell
            title="Páginas"
            description="Gerencie as páginas do site"
            addLabel="Nova Página"
            onAdd={() => {}}
          />
        );
      case "galeria":
        return <GaleriaContent />;
      case "agenda":
        return (
          <AdminPageShell
            title="Agenda"
            description="Gerencie os eventos e programações"
            addLabel="Novo Evento"
            onAdd={() => {}}
          />
        );
      case "config":
        return (
          <AdminPageShell
            title="Configurações"
            description="Configurações gerais do site"
          />
        );
      default:
        return <DashboardContent onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[hsl(220,20%,96%)]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-60"
        } bg-white border-r border-[hsl(220,20%,90%)] flex flex-col transition-all duration-200`}
      >
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
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
