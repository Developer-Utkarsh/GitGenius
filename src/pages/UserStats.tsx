import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { octokit } from "@/utils/github";
import { StatsDisplay } from "@/components/stats-display";
import { LanguageDistribution } from "@/components/charts/language-distribution";
import { RepositoryList } from "@/components/repository/repository-list";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { YearSelector } from "@/components/year-selector";
import { useState } from "react";

const UserStats = () => {
  const { username } = useParams();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("all");

  const { data: userData } = useQuery({
    queryKey: ["github-user", username],
    queryFn: async () => {
      if (!username) return null;
      const response = await octokit.request('GET /users/{username}', {
        username,
      });
      return response.data;
    },
  });

  const accountCreatedYear = userData ? new Date(userData.created_at).getFullYear() : new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - accountCreatedYear + 1 },
    (_, i) => currentYear - i
  );

  const { data: reposData } = useQuery({
    queryKey: ["github-repos", username, selectedYear],
    queryFn: async () => {
      if (!username) return null;
      const response = await octokit.request('GET /users/{username}/repos', {
        username,
        per_page: 100,
        sort: 'updated',
      });
      
      const reposWithDetails = await Promise.all(
        response.data.map(async (repo) => {
          try {
            const [languages, commits, pulls] = await Promise.all([
              octokit.request('GET /repos/{owner}/{repo}/languages', {
                owner: username,
                repo: repo.name,
              }),
              octokit.request('GET /repos/{owner}/{repo}/commits', {
                owner: username,
                repo: repo.name,
                ...(selectedYear !== "all" && {
                  since: `${selectedYear}-01-01T00:00:00Z`,
                  until: `${selectedYear}-12-31T23:59:59Z`,
                }),
              }),
              octokit.request('GET /repos/{owner}/{repo}/pulls', {
                owner: username,
                repo: repo.name,
                state: 'all',
              }),
            ]);
            
            return {
              ...repo,
              languages: languages.data,
              commits: commits.data.length,
              pulls: pulls.data.length,
              created_at: repo.created_at,
            };
          } catch (error) {
            console.error(`Error fetching details for ${repo.name}:`, error);
            return {
              ...repo,
              languages: {},
              commits: 0,
              pulls: 0,
              created_at: repo.created_at,
            };
          }
        })
      );
      
      return reposWithDetails;
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "The profile link has been copied to your clipboard.",
    });
  };

  const aggregatedLanguages = reposData?.reduce((acc, repo) => {
    Object.entries(repo.languages || {}).forEach(([lang, bytes]) => {
      acc[lang] = (acc[lang] || 0) + (bytes as number);
    });
    return acc;
  }, {} as Record<string, number>) || {};

  if (!userData || !reposData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">
            {username}'s GitHub Stats
          </h1>
          <div className="flex gap-4">
            <YearSelector
              years={years}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              accountCreatedYear={accountCreatedYear}
            />
            <Button
              variant="outline"
              className="gap-2 bg-white/5 hover:bg-white/10"
              onClick={handleCopyLink}
            >
              <Share2 className="h-4 w-4" />
              <Copy className="h-4 w-4" />
              Share Profile
            </Button>
          </div>
        </div>

        <StatsDisplay
          reposCount={reposData.length}
          languagesCount={Object.keys(aggregatedLanguages).length}
          totalLoc={Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0)}
          averageLoc={Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0) / reposData.length}
          selectedYear={selectedYear}
          totalStars={reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)}
          totalPRs={reposData.reduce((acc, repo) => acc + (repo.pulls || 0), 0)}
          totalCommits={reposData.reduce((acc, repo) => acc + (repo.commits || 0), 0)}
        />

        <LanguageDistribution languages={aggregatedLanguages} />

        <RepositoryList repositories={reposData} />
      </div>
    </div>
  );
};

export default UserStats;