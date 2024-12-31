import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { octokit, isAuthenticated } from "@/utils/github";
import { GitHubAuth } from "@/components/github-auth";
import { StatsDisplay } from "@/components/stats-display";
import { GitHubSearch } from "@/components/search/github-search";
import { LanguageDistribution } from "@/components/charts/language-distribution";
import { RepositoryList } from "@/components/repository/repository-list";

const MIN_USERNAME_LENGTH = 3;

const Index = () => {
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["github-user", debouncedUsername],
    queryFn: async () => {
      if (!debouncedUsername) return null;
      const response = await octokit.request('GET /users/{username}', {
        username: debouncedUsername,
      });
      return response.data;
    },
    enabled: debouncedUsername.length >= MIN_USERNAME_LENGTH && isAuthenticated(),
  });

  const { data: reposData, isLoading: reposLoading } = useQuery({
    queryKey: ["github-repos", debouncedUsername, selectedYear],
    queryFn: async () => {
      if (!debouncedUsername) return null;
      const response = await octokit.request('GET /users/{username}/repos', {
        username: debouncedUsername,
        per_page: 100,
        sort: 'updated',
      });
      
      const reposWithDetails = await Promise.all(
        response.data.map(async (repo) => {
          try {
            const [languages, commits, pulls] = await Promise.all([
              octokit.request('GET /repos/{owner}/{repo}/languages', {
                owner: debouncedUsername,
                repo: repo.name,
              }),
              octokit.request('GET /repos/{owner}/{repo}/commits', {
                owner: debouncedUsername,
                repo: repo.name,
                since: `${selectedYear}-01-01T00:00:00Z`,
                until: `${selectedYear}-12-31T23:59:59Z`,
              }),
              octokit.request('GET /repos/{owner}/{repo}/pulls', {
                owner: debouncedUsername,
                repo: repo.name,
                state: 'all',
              }),
            ]);
            
            return {
              ...repo,
              languages: languages.data,
              commits: commits.data.length,
              pulls: pulls.data.length,
            };
          } catch (error) {
            console.error(`Error fetching details for ${repo.name}:`, error);
            return {
              ...repo,
              languages: {},
              commits: 0,
              pulls: 0,
            };
          }
        })
      );
      
      return reposWithDetails;
    },
    enabled: !!userData && isAuthenticated(),
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  const aggregatedLanguages = reposData?.reduce((acc, repo) => {
    Object.entries(repo.languages || {}).forEach(([lang, bytes]) => {
      acc[lang] = (acc[lang] || 0) + (bytes as number);
    });
    return acc;
  }, {} as Record<string, number>) || {};

  const totalStars = reposData?.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0) || 0;
  const totalPRs = reposData?.reduce((acc, repo) => acc + (repo.pulls || 0), 0) || 0;
  const totalCommits = reposData?.reduce((acc, repo) => acc + (repo.commits || 0), 0) || 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">
            GitHub Stats Analyzer
          </h1>
          <p className="text-lg text-gray-400 animate-float">
            Discover insights about any GitHub profile
          </p>
        </div>

        <GitHubAuth />

        <div className="space-y-6">
          <GitHubSearch
            onSearch={setDebouncedUsername}
            isDisabled={!isAuthenticated()}
            minLength={MIN_USERNAME_LENGTH}
          />

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] bg-white/5 border-gray-700/50">
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
            <StatsDisplay
              reposCount={reposData.length}
              languagesCount={Object.keys(aggregatedLanguages).length}
              totalLoc={Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0)}
              averageLoc={Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0) / reposData.length}
              selectedYear={selectedYear}
              totalStars={totalStars}
              totalPRs={totalPRs}
              totalCommits={totalCommits}
            />

            <LanguageDistribution languages={aggregatedLanguages} />

            <RepositoryList repositories={reposData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;