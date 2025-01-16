import { motion } from "motion/react";
import {
  Code2,
  GitBranch,
  Star,
  Calendar,
  GitCommit,
  Languages,
  Eye,
  GitFork,
  FileCode,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface RepositoryCardProps {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  branches: number;
  created_at: string;
  commits: Array<{ date: string; count: number }>;
  languages: { [key: string]: number };
  loc: number;
  forks?: number;
  watchers?: number;
}

export const RepositoryCard = ({
  name,
  description,
  stars,
  language,
  branches,
  created_at,
  commits,
  languages,
  loc,
  forks = 0,
  watchers = 0,
}: RepositoryCardProps) => {
  const totalLanguages = Object.keys(languages).length;
  const createdDate = format(new Date(created_at), "MMM dd, yyyy");
  const totalCommits = commits.reduce((sum, commit) => sum + commit.count, 0);
  const age = formatDistanceToNow(new Date(created_at));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-primary/5 to-blue-500/10 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-black/40" />

        <CardContent className="relative p-6 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              {name}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {description}
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <StatItem
              icon={<Star className="text-yellow-400" />}
              value={stars}
              label="Stars"
            />
            <StatItem
              icon={<GitFork className="text-blue-400" />}
              value={forks}
              label="Forks"
            />
            <StatItem
              icon={<GitCommit className="text-green-400" />}
              value={totalCommits}
              label="Commits"
            />
            <StatItem
              icon={<FileCode className="text-purple-400" />}
              value={loc}
              label="Lines of Code"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {language && (
              <Badge variant="outline" className="bg-primary/20 border-0">
                {language}
              </Badge>
            )}
            <Badge variant="outline" className="bg-blue-500/20 border-0">
              {age} old
            </Badge>
            <Badge variant="outline" className="bg-green-500/20 border-0">
              {loc.toLocaleString()} LOC
            </Badge>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="text-xs text-gray-400 space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="h-3 w-3 text-pink-400" />
                {Object.keys(languages).join(", ")}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-blue-400" />
                Created on {createdDate}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatItem = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <Tooltip>
    <TooltipTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5 transition-colors">
      <div className="flex items-center  gap-4 min-w-[80px]">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="h-4 w-4 -mt-[6px]"
        >
          {icon}
        </motion.div>
        <span className="text-gray-300 font-medium">
          {value.toLocaleString()}
        </span>
      </div>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);
