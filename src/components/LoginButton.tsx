import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function LoginButton() {
  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const scope = "read:user repo user:email";

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    window.location.href = githubAuthUrl;
  };

  return (
    <Button
      onClick={handleLogin}
      className="flex items-center gap-2"
      variant="outline"
    >
      <Github className="h-4 w-4" />
      Login with GitHub
    </Button>
  );
}
