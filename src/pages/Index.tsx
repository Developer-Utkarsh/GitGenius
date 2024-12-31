import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Code2, FileCode, GitBranch, Languages, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();

  // Handle input changes with debounce
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    // Only update debounced value if username is at least 3 characters
    if (value.length >= 3) {
      const timeoutId = setTimeout(() => {
        setDebouncedUsername(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setDebouncedUsername("");
    }
  };

  const { data: userData, isLoading } = useQuery({
    queryKey: ["github-user", debouncedUsername],
    queryFn: async () => {
      if (!debouncedUsername) return null;
      const response = await fetch(`https://api.github.com/users/${debouncedUsername}`);
      if (!response.ok) {
        throw new Error("User not found");
      }
      return response.json();
    },
    enabled: debouncedUsername.length >= 3,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "User not found. Please check the username and try again.",
          variant: "destructive",
        });
      },
    },
  });

  const { data: reposData } = useQuery({
    queryKey: ["github-repos", debouncedUsername],
    queryFn: async () => {
      if (!debouncedUsername) return null;
      const response = await fetch(`https://api.github.com/users/${debouncedUsername}/repos`);
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      return response.json();
    },
    enabled: !!userData,
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-in">
            <h1 className="text-4xl font-bold tracking-tight dark:text-white">
              GitHub Stats Analyzer
            </h1>
            <p className="text-lg text-gray-400">
              Enter a GitHub username to analyze their repositories
            </p>
          </div>

          <div className="relative animate-in">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Enter GitHub username..."
              className="pl-10 pr-4 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
            />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px] mt-4">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="text-center text-gray-400">Loading...</div>
          )}

          {userData && reposData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Total Repositories"
                value={reposData.length}
                icon={<GitBranch className="h-4 w-4 text-primary" />}
              />
              <StatsCard
                title="Languages Used"
                value={new Set(reposData.map((repo: any) => repo.language).filter(Boolean)).size}
                icon={<Languages className="h-4 w-4 text-primary" />}
              />
              <StatsCard
                title="Total Stars"
                value={reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0)}
                icon={<Code2 className="h-4 w-4 text-primary" />}
              />
              <StatsCard
                title="Total Forks"
                value={reposData.reduce((acc: number, repo: any) => acc + repo.forks_count, 0)}
                icon={<FileCode className="h-4 w-4 text-primary" />}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;