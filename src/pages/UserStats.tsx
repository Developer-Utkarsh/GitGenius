import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { octokit } from "@/utils/github";
import { useState } from "react";
import { UserHeader } from "@/components/stats/user-header";
import { StatsSection } from "@/components/stats/stats-section";
import { Repository } from "@/types/github";

const UserStats = () => {
  const { username } = useParams();
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
            
            // Ensure created_at is present in the returned object
            return {
              ...repo,
              languages: languages.data,
              commits: commits.data.length,
              pulls: pulls.data.length,
              created_at: repo.created_at || new Date().toISOString(), // Provide default if missing
            } as Repository;
          } catch (error) {
            console.error(`Error fetching details for ${repo.name}:`, error);
            return {
              ...repo,
              languages: {},
              commits: 0,
              pulls: 0,
              created_at: new Date().toISOString(), // Provide default if error
            } as Repository;
          }
        })
      );
      
      return reposWithDetails;
    },
  });

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
    <div className="min-h-screen py-8 px-4 bg-black">
      <div className="max-w-7xl mx-auto space-y-8">
        <UserHeader
          username={username || ""}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          years={years}
          accountCreatedYear={accountCreatedYear}
        />

        <StatsSection
          reposData={reposData}
          selectedYear={selectedYear}
          aggregatedLanguages={aggregatedLanguages}
        />
      </div>
    </div>
  );
};

export default UserStats;