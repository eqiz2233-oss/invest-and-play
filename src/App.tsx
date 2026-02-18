import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LevelPage from "./pages/LevelPage";
import Snapshot from "./pages/Snapshot";
import LevelList from "./pages/LevelList";
import PlanSelection from "./pages/PlanSelection";
import PlanFlow from "./pages/PlanFlow";
import Sandbox from "./pages/Sandbox";
import NotFound from "./pages/NotFound";

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <LanguageProvider>
        <GameProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/level/:id" element={<LevelPage />} />
              <Route path="/levels" element={<LevelList />} />
              <Route path="/plan" element={<PlanSelection />} />
              <Route path="/plan/flow" element={<PlanFlow />} />
              <Route path="/snapshot" element={<Snapshot />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </LanguageProvider>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
