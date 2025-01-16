import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Users,
  GitFork,
  MapPin,
  Link2,
  Github,
  Twitter,
  Mail,
  Building2,
  Star,
  GitPullRequest,
  GitCommit,
  Clock,
  Award,
  Cpu,
  Code2,
  FileCode,
  Globe2,
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileOverviewProps {
  user: any;
  repositories: {
    stargazers_count?: number;
    pulls?: number;
    commits?: Array<{ date: string; count: number }>;
    languages?: Record<string, number>;
  }[];
  stats: {
    reposCount: number;
    languagesCount: number;
    totalLoc: number;
    averageLoc: number;
    totalStars: number;
    totalPRs: number;
    totalCommits: number;
  };
}

export function ProfileOverview({
  user,
  repositories,
  stats,
}: ProfileOverviewProps) {
  const joinedDate = format(new Date(user.created_at), "MMMM yyyy");
  const accountAge = differenceInYears(new Date(), new Date(user.created_at));
  const averageLocPerDay = Math.round(stats.totalLoc / 365);

  const calculateTopLanguages = (repos: any[]) => {
    const languagesMap = repos.reduce((acc, repo) => {
      if (repo.languages) {
        Object.entries(repo.languages).forEach(([lang, bytes]) => {
          acc[lang] =
            (acc[lang] || 0) + (typeof bytes === "number" ? bytes : 0);
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(languagesMap)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .slice(0, 5)
      .map(([lang]) => lang);
  };

  const topLanguages = calculateTopLanguages(repositories);

  const socialLinks = [
    user.blog && {
      icon: <Globe2 className="h-3.5 w-3.5" />,
      url: user.blog.startsWith("http") ? user.blog : `https://${user.blog}`,
      label: "Website",
    },
    {
      icon: <Github className="h-3.5 w-3.5" />,
      url: `https://github.com/${user.login}`,
      label: "GitHub",
    },
    user.twitter_username && {
      icon: <Twitter className="h-3.5 w-3.5" />,
      url: `https://twitter.com/${user.twitter_username}`,
      label: "Twitter",
    },
  ].filter(Boolean);

  const calculateTotalContributions = (
    repos: ProfileOverviewProps["repositories"]
  ) => {
    return (
      repos.reduce((total, repo) => {
        if (repo.commits) {
          return (
            total + repo.commits.reduce((sum, commit) => sum + commit.count, 0)
          );
        }
        return total;
      }, 0) + stats.totalPRs
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <Card className="overflow-hidden border-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-primary/5 to-blue-500/10 backdrop-blur-xl animate-gradient" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <CardContent className="relative p-8">
          <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
            <motion.div
              className="text-center space-y-4 w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-36 mx-auto">
                <motion.div
                  initial={{ scale: 0.5, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
                >
                  <Avatar className="h-36 w-36 ring-4 ring-primary/20 ring-offset-4 ring-offset-background/50 animate-avatar-glow">
                    <AvatarImage src={user.avatar_url} alt={user.login} />
                    <AvatarFallback>
                      {user.login[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  {user.name || user.login}
                </h2>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-gray-400 font-medium">@{user.login}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Joined {joinedDate}
                    </span>
                    <div className="flex items-center gap-2">
                      {socialLinks.map((link, index) => (
                        <TooltipProvider key={link.url}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-primary transition-colors"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                              >
                                {link.icon}
                              </motion.a>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                              {link.url}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {user.bio && (
                <motion.p
                  className="text-gray-300 text-lg leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {user.bio}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-0">
                  {user.type}
                </Badge>
                {user.hireable && (
                  <Badge className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-0">
                    Open to Work
                  </Badge>
                )}
                <Badge className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-0">
                  {accountAge}+ Years
                </Badge>
              </div>

              {topLanguages.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {topLanguages.map((lang, index) => (
                    <motion.div
                      key={lang}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Badge
                        variant="outline"
                        className="border-primary/20 text-gray-300 hover:bg-primary/5"
                      >
                        {lang}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div className="w-full space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Code2 className="h-6 w-6 text-emerald-400" />}
                  value={stats.totalLoc.toLocaleString()}
                  label="Total Lines of Code"
                  description={`~${averageLocPerDay.toLocaleString()} lines/day`}
                  className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500/30 hover:to-emerald-500/10"
                  delay={0.7}
                />
                <StatCard
                  icon={<FileCode className="h-6 w-6 text-violet-400" />}
                  value={Math.round(stats.averageLoc).toLocaleString()}
                  label="Average LOC/Repository"
                  className="bg-gradient-to-br from-violet-500/20 to-violet-500/5 hover:from-violet-500/30 hover:to-violet-500/10"
                  delay={0.8}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<GitFork className="h-5 w-5 text-primary" />}
                  value={stats.reposCount}
                  label="Repositories"
                  delay={0.9}
                />
                <StatCard
                  icon={<Users className="h-5 w-5 text-blue-400" />}
                  value={user.followers}
                  label="Followers"
                  delay={1.0}
                />
                <StatCard
                  icon={<Star className="h-5 w-5 text-yellow-400" />}
                  value={stats.totalStars}
                  label="Total Stars"
                  delay={1.1}
                />
                <StatCard
                  icon={<GitCommit className="h-5 w-5 text-green-400" />}
                  value={calculateTotalContributions(repositories)}
                  label="Total Contributions"
                  delay={1.2}
                />
                <StatCard
                  icon={<GitPullRequest className="h-5 w-5 text-blue-400" />}
                  value={stats.totalPRs}
                  label="Pull Requests"
                  delay={1.3}
                />
                <StatCard
                  icon={<Award className="h-5 w-5 text-orange-400" />}
                  value={user.public_gists || 0}
                  label="Gists"
                  delay={1.4}
                />
                <StatCard
                  icon={<Clock className="h-5 w-5 text-rose-400" />}
                  value={accountAge}
                  label="Years Active"
                  delay={1.5}
                />
                <StatCard
                  icon={<Cpu className="h-5 w-5 text-cyan-400" />}
                  value={stats.languagesCount}
                  label="Languages"
                  delay={1.6}
                />
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  description?: string;
  className?: string;
  delay?: number;
}

const StatCard = ({
  icon,
  value,
  label,
  description,
  className,
  delay = 0,
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      duration: 0.5,
      delay,
      type: "spring",
      stiffness: 100,
    }}
    whileHover={{ scale: 1.02 }}
    className={cn(
      "rounded-lg p-4 text-center space-y-2 transition-all duration-300",
      "backdrop-blur-sm border border-white/10",
      "hover:border-white/20 hover:shadow-lg",
      className
    )}
  >
    <div className="flex justify-center">{icon}</div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </motion.div>
);

interface InfoItemProps {
  icon: React.ReactNode;
  text: string;
  isLink?: boolean;
  href?: string;
}

const InfoItem = ({ icon, text, isLink, href }: InfoItemProps) => {
  const content = (
    <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded-md">
      {icon}
      <span className="truncate">{text}</span>
    </div>
  );

  return isLink ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-primary transition-colors"
    >
      {content}
    </a>
  ) : (
    content
  );
};
