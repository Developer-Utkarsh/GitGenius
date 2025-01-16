import { Button } from "@/components/ui/button";
import { initiateGitHubLogin } from "@/utils/github";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const GitHubAuth = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Button onClick={initiateGitHubLogin} variant="outline">
      Sign in with GitHub
    </Button>
  );
};
