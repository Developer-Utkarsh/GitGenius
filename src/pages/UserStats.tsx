import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOctokit } from "@/utils/github";
import { useState, useEffect } from "react";
import { UserHeader } from "@/components/stats/user-header";
import { StatsSection } from "@/components/stats/stats-section";
import { Repository } from "@/types/github";
import { useToast } from "@/hooks/use-toast";
import { checkGitHubAccess } from "@/utils/github-api";
import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary";
import { StatsLoader } from "@/components/loading/stats-loader";

const UserStats = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  // Redirect to home if no username is provided
  useEffect(() => {
    if (!username) {
      navigate("/");
      toast({
        title: "Error",
        description: "Please enter a GitHub username",
        variant: "destructive",
      });
    }
  }, [username, navigate, toast]);

  const { data: userData } = useQuery({
    queryKey: ["github-user", username],
    queryFn: async () => {
      if (!username) return null;
      try {
        const response = await getOctokit().request("GET /users/{username}", {
          username,
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Error",
          description: "User not found or API error occurred",
          variant: "destructive",
        });
        navigate("/");
        return null;
      }
    },
    enabled: !!username,
  });

  const accountCreatedYear = userData
    ? new Date(userData.created_at).getFullYear()
    : new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - accountCreatedYear + 1 },
    (_, i) => currentYear - i
  );

  const { data: apiAccess } = useQuery({
    queryKey: ["github-access"],
    queryFn: checkGitHubAccess,
    refetchInterval: 60000, // Check every minute
  });

  const { data: reposData } = useQuery({
    queryKey: ["github-repos", username, selectedYear],
    queryFn: async () => {
      const octokit = getOctokit();
      if (!octokit) throw new Error("Not authenticated");

      const response = await octokit.request("GET /users/{username}/repos", {
        username,
        per_page: 100,
        sort: "updated",
      });

      const reposWithDetails = await Promise.all(
        response.data.map(async (repo) => {
          try {
            const [languages, commits, pulls] = await Promise.all([
              octokit.request("GET /repos/{owner}/{repo}/languages", {
                owner: username,
                repo: repo.name,
              }),
              octokit.request("GET /repos/{owner}/{repo}/commits", {
                owner: username,
                repo: repo.name,
                per_page: 100,
                ...(selectedYear !== "all" && {
                  since: `${selectedYear}-01-01T00:00:00Z`,
                  until: `${selectedYear}-12-31T23:59:59Z`,
                }),
              }),
              octokit.request("GET /repos/{owner}/{repo}/pulls", {
                owner: username,
                repo: repo.name,
                state: "all",
              }),
            ]);

            return {
              ...repo,
              languages: languages.data || {},
              commits: Array.isArray(commits.data)
                ? commits.data.map((commit) => ({
                    date:
                      commit.commit.author?.date || new Date().toISOString(),
                    count: 1,
                  }))
                : [],
              pulls: pulls.data.length || 0,
              created_at: repo.created_at || new Date().toISOString(),
            } as Repository;
          } catch (error) {
            console.error(`Error fetching details for ${repo.name}:`, error);
            return {
              ...repo,
              languages: {},
              commits: [],
              pulls: 0,
              created_at: repo.created_at || new Date().toISOString(),
            } as Repository;
          }
        })
      );

      return reposWithDetails;
    },
    enabled: !!username && !!userData,
  });

  if (!userData || !reposData) {
    return <StatsLoader />;
  }

  return (
    <AuthErrorBoundary>
      <div className="fixed top-0 z-[-2] min-h-screen w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div>
        <div className="min-h-screen py-8 px-0 relative h-full w-full">
          <div className="max-w-7xl mx-auto space-y-8">
            <UserHeader
              username={username}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              years={years}
              accountCreatedYear={accountCreatedYear}
            />

            <StatsSection
              reposData={reposData}
              selectedYear={selectedYear}
              aggregatedLanguages={reposData.reduce((acc, repo) => {
                Object.entries(repo.languages || {}).forEach(
                  ([lang, bytes]) => {
                    acc[lang] = (acc[lang] || 0) + (bytes as number);
                  }
                );
                return acc;
              }, {} as Record<string, number>)}
              userData={userData}
              onYearChange={setSelectedYear}
            />
          </div>
        </div>
      </div>
    </AuthErrorBoundary>
  );
};

export default UserStats;
