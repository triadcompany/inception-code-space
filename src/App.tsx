import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cultos from "./pages/Cultos";
import CultoDetalhe from "./pages/CultoDetalhe";
import EstudosBiblicos from "./pages/EstudosBiblicos";
import EstudoDetalhe from "./pages/EstudoDetalhe";
import Sobre from "./pages/Sobre";
import VinteAnos from "./pages/VinteAnos";
import Fotos from "./pages/Fotos";
import OInicio from "./pages/OInicio";
import Contato from "./pages/Contato";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cultos" element={<Cultos />} />
          <Route path="/cultos/:id" element={<CultoDetalhe />} />
          <Route path="/estudos" element={<EstudosBiblicos />} />
          <Route path="/estudos/:id" element={<EstudoDetalhe />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/sobre/20-anos" element={<VinteAnos />} />
          <Route path="/sobre/20-anos/fotos" element={<Fotos />} />
          <Route path="/sobre/o-inicio" element={<OInicio />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
