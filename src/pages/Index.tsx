import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Code2, FileCode, GitBranch, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { RepositoryCard } from "@/components/repository-card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Octokit } from "octokit";

const octokit = new Octokit();

const MIN_USERNAME_LENGTH = 3;
const DEBOUNCE_DELAY = 500; // ms

const Index = () => {
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();

  // Debounce username changes
  useEffect(() => {
    if (username.length >= MIN_USERNAME_LENGTH) {
      const timeoutId = setTimeout(() => {
        setDebouncedUsername(username);
      }, DEBOUNCE_DELAY);
      return () => clearTimeout(timeoutId);
    } else {
      setDebouncedUsername("");
    }
  }, [username]);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["github-user", debouncedUsername],
    queryFn: async () => {
      if (!debouncedUsername) return null;
      const response = await octokit.request('GET /users/{username}', {
        username: debouncedUsername,
      });
      return response.data;
    },
    enabled: debouncedUsername.length >= MIN_USERNAME_LENGTH,
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

  const { data: reposData, isLoading: reposLoading } = useQuery({
    queryKey: ["github-repos", debouncedUsername],
    queryFn: async () => {
      if (!debouncedUsername) return null;
      const response = await octokit.request('GET /users/{username}/repos', {
        username: debouncedUsername,
        per_page: 100,
        sort: 'updated',
      });
      
      // Get LOC for each repo
      const reposWithLoc = await Promise.all(
        response.data.map(async (repo) => {
          try {
            const languages = await octokit.request('GET /repos/{owner}/{repo}/languages', {
              owner: debouncedUsername,
              repo: repo.name,
            });
            
            const totalLoc = Object.values(languages.data).reduce((acc: number, curr: number) => acc + curr, 0);
            
            return {
              ...repo,
              totalLoc,
              languages: languages.data,
            };
          } catch (error) {
            console.error(`Error fetching languages for ${repo.name}:`, error);
            return {
              ...repo,
              totalLoc: 0,
              languages: {},
            };
          }
        })
      );
      
      return reposWithLoc;
    },
    enabled: !!userData,
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  const chartData = reposData?.map(repo => ({
    name: repo.name,
    loc: repo.totalLoc,
  })) || [];

  const totalLoc = reposData?.reduce((acc, repo) => acc + repo.totalLoc, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              GitHub Stats Analyzer
            </h1>
            <p className="text-lg text-gray-400">
              Enter a GitHub username to analyze their repositories
            </p>
          </div>

          <div className="relative animate-fade-up">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Enter GitHub username..."
              className="pl-10 pr-4 py-2 w-full dark:bg-gray-800/50 dark:border-gray-700 backdrop-blur-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={MIN_USERNAME_LENGTH}
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

          {(userLoading || reposLoading) && (
            <div className="text-center text-gray-400 animate-pulse">
              Loading...
            </div>
          )}

          {userData && reposData && (
            <div className="space-y-8 animate-fade-up">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Repositories"
                  value={reposData.length}
                  icon={<GitBranch className="h-4 w-4 text-blue-500" />}
                />
                <StatsCard
                  title="Languages Used"
                  value={new Set(reposData.map((repo: any) => repo.language).filter(Boolean)).size}
                  icon={<Languages className="h-4 w-4 text-purple-500" />}
                />
                <StatsCard
                  title="Total Lines of Code"
                  value={totalLoc.toLocaleString()}
                  icon={<Code2 className="h-4 w-4 text-green-500" />}
                />
                <StatsCard
                  title="Average LOC/Repo"
                  value={Math.round(totalLoc / reposData.length).toLocaleString()}
                  icon={<FileCode className="h-4 w-4 text-pink-500" />}
                />
              </div>

              <div className="glass-card p-6 rounded-lg animate-fade-up">
                <h3 className="text-xl font-semibold mb-4">Lines of Code by Repository</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" angle={45} textAnchor="start" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="loc" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reposData.map((repo: any) => (
                  <RepositoryCard
                    key={repo.id}
                    name={repo.name}
                    description={repo.description || "No description available"}
                    stars={repo.stargazers_count}
                    language={repo.language || "Unknown"}
                    branches={1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;