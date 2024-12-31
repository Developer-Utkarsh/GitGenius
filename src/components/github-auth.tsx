import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setGithubToken, isAuthenticated } from "@/utils/github";
import { useToast } from "@/hooks/use-toast";

export const GitHubAuth = () => {
  const [token, setToken] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      setGithubToken(token.trim());
      toast({
        title: "Success",
        description: "GitHub token has been saved",
      });
    }
  };

  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">GitHub Authentication Required</h2>
      <p className="text-gray-400 mb-4">
        To avoid rate limiting, please provide a GitHub personal access token.
        You can create one at{" "}
        <a
          href="https://github.com/settings/tokens"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-400"
        >
          GitHub Settings
        </a>
        .
      </p>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter GitHub token"
          className="flex-1"
        />
        <Button type="submit">Save Token</Button>
      </form>
    </div>
  );
};