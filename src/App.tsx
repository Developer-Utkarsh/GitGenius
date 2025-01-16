import { Loader2 } from "lucide-react";
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { handleOAuthCallback } from "@/utils/github";
import { useToast } from "@/hooks/use-toast";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Lazy load main pages
const Index = lazy(() => import("./pages/Index"));
const UserStats = lazy(() => import("./pages/UserStats"));

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="fixed inset-0 w-full h-full ">
    <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
    <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  </div>
);

const AuthCallbackHandler = ({ location, toast, queryClient, onSuccess }) => {
  const { fetchUser } = useAuth();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get("code");
    if (code) {
      handleOAuthCallback(code)
        .then(() => {
          fetchUser();
          onSuccess();
        })
        .catch((error) => {
          console.error("Auth error:", error);
          toast({
            title: "Authentication failed",
            description: "Please try again",
            variant: "destructive",
          });
        });
    }
  }, [location.search, fetchUser, onSuccess, toast]);

  return null;
};

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="text-gray-400">Authenticating with GitHub...</p>
      </div>
      <AuthCallbackHandler
        location={location}
        toast={toast}
        queryClient={queryClient}
        onSuccess={() => navigate("/", { replace: true })}
      />
    </div>
  );
};

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/auth/callback",
      element: <AuthCallback />,
    },
    {
      path: "/:username",
      element: <UserStats />,
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => {
  useEffect(() => {
    const loader = document.querySelector(".app-loader");
    if (loader) {
      loader.remove();
    }
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <RouterProvider router={router}>
              <Suspense fallback={<LoadingScreen />}>
                <Toaster />
                <Sonner />
              </Suspense>
            </RouterProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
