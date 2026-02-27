import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  Home, Video, BookOpen, FileText, Image, Calendar, Settings,
  ExternalLink, LogOut, ChevronLeft,
} from "lucide-react";
import { useState, lazy, Suspense } from "react";
import DashboardContent from "@/components/admin/DashboardContent";

// Lazy load heavy admin components
const CultosContent = lazy(() => import("@/components/admin/CultosContent"));
const EstudosContent = lazy(() => import("@/components/admin/EstudosContent"));
const GaleriaContent = lazy(() => import("@/components/admin/GaleriaContent"));
const ConfiguracoesContent = lazy(() => import("@/components/admin/ConfiguracoesContent"));
const PaginasContent = lazy(() => import("@/components/admin/PaginasContent"));

const AdminSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
  </div>
);

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
        return <PaginasContent />;
      case "galeria":
        return <GaleriaContent />;
      case "agenda":
        return (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[hsl(220,30%,20%)]">Agenda</h1>
                <p className="text-[hsl(220,15%,55%)]">Gerencie os eventos e programações</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[hsl(220,20%,90%)] p-12 text-center">
              <p className="text-[hsl(220,15%,55%)]">Nenhum item cadastrado ainda.</p>
            </div>
          </div>
        );
      case "config":
        return <ConfiguracoesContent />;
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
        } bg-white border-r border-[hsl(220,20%,90%)] flex flex-col transition-all duration-300 ease-in-out shadow-sm`}
      >
        <div className="p-4 flex items-center justify-between border-b border-[hsl(220,20%,90%)]">
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h2 className="font-bold text-[hsl(220,30%,20%)] text-sm">Painel Admin</h2>
              <p className="text-xs text-[hsl(220,15%,55%)]">Tabernáculo</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-[hsl(220,15%,55%)] hover:text-[hsl(220,30%,20%)] hover:bg-[hsl(220,20%,93%)] rounded-lg p-1.5 transition-all duration-200"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <p className={`text-[10px] uppercase text-[hsl(220,15%,55%)] px-3 py-2 transition-opacity duration-200 ${sidebarCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
            Menu
          </p>
          {menuItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden ${
                activeMenu === item.id
                  ? "bg-[hsl(218,45%,22%)] text-white shadow-md shadow-[hsl(218,45%,22%)/0.2]"
                  : "text-[hsl(220,20%,40%)] hover:bg-[hsl(220,20%,93%)] active:scale-[0.97]"
              }`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <item.icon className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${activeMenu !== item.id ? "group-hover:scale-110" : ""}`} />
              {!sidebarCollapsed && (
                <span className="transition-opacity duration-200">{item.label}</span>
              )}
              {activeMenu === item.id && (
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[hsl(var(--primary))] rounded-r-full" />
              )}
            </button>
          ))}

          <p className={`text-[10px] uppercase text-[hsl(220,15%,55%)] px-3 py-2 mt-4 transition-opacity duration-200 ${sidebarCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
            Links
          </p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[hsl(220,20%,40%)] hover:bg-[hsl(220,20%,93%)] active:scale-[0.97] transition-all duration-200 group"
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            {!sidebarCollapsed && <span>Ver Site</span>}
          </a>
        </nav>

        <div className="p-2 border-t border-[hsl(220,20%,90%)]">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 active:scale-[0.97] transition-all duration-200 group"
          >
            <LogOut className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<AdminSpinner />}>
            <div key={activeMenu} className="animate-fade-in">
              {renderContent()}
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
