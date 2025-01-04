import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { handleOAuthCallback } from "@/utils/github";
import { useToast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import UserStats from "./pages/UserStats";

const queryClient = new QueryClient();

const AuthCallback = () => {
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');
    if (code) {
      handleOAuthCallback(code).then((success) => {
        if (success) {
          toast({
            title: "Success",
            description: "Successfully authenticated with GitHub",
          });
          window.location.href = '/';
        } else {
          toast({
            title: "Error",
            description: "Failed to authenticate with GitHub",
            variant: "destructive",
          });
        }
      });
    }
  }, [location, toast]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/:username" element={<UserStats />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;