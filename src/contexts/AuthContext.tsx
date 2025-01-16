import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getOctokit } from "@/utils/github";
import { Octokit } from "@octokit/rest";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  logout: () => {},
  fetchUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("github_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.request("GET /user");
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("github_token");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("github_token");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, user, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
