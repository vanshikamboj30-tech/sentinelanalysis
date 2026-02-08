import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FrontPage from "./pages/FrontPage";
import Features from "./pages/Features";
import Analyze from "./pages/Analyze";
import ChatPage from "./pages/ChatPage";
import LiveFeed from "./pages/LiveFeed";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Router = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/live" element={<LiveFeed />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default Router;
