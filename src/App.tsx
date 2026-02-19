import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import PlayPage from "./pages/PlayPage";
import QuestsPage from "./pages/QuestsPage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import Snapshot from "./pages/Snapshot";
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
              {/* Landing — no sidebar */}
              <Route path="/" element={<Index />} />

              {/* App shell — with sidebar */}
              <Route
                path="*"
                element={
                  <AppLayout>
                    <Routes>
                      <Route path="/plan" element={<PlayPage />} />
                      <Route path="/plan/flow" element={<PlanFlow />} />
                      <Route path="/quests" element={<QuestsPage />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/dashboard" element={<QuestsPage />} />
                      <Route path="/snapshot" element={<Snapshot />} />
                      <Route path="/sandbox" element={<Sandbox />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </LanguageProvider>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
