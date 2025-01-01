import { Code2, GitBranch, Star, Calendar, GitCommit, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RepositoryCardProps {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  branches: number;
  created_at: string;
  commits: number;
  languages: { [key: string]: number };
  loc: number;
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
}: RepositoryCardProps) => {
  const totalLanguages = Object.keys(languages).length;
  const createdDate = format(new Date(created_at), 'MMM dd, yyyy');

  return (
    <Card className="glass-card hover:scale-105 transition-all duration-300 border border-transparent hover:border-gradient-to-r from-blue-500 to-purple-500">
      <CardHeader>
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{stars}</span>
            </TooltipTrigger>
            <TooltipContent>Stars</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
              <Code2 className="h-4 w-4 text-blue-400" />
              <span>{language || 'Unknown'}</span>
            </TooltipTrigger>
            <TooltipContent>Primary Language</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
              <GitBranch className="h-4 w-4 text-green-400" />
              <span>{branches}</span>
            </TooltipTrigger>
            <TooltipContent>Branches</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>{createdDate}</span>
            </TooltipTrigger>
            <TooltipContent>Created On</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
              <GitCommit className="h-4 w-4 text-orange-400" />
              <span>{commits}</span>
            </TooltipTrigger>
            <TooltipContent>Total Commits</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
              <Languages className="h-4 w-4 text-pink-400" />
              <span>{totalLanguages}</span>
            </TooltipTrigger>
            <TooltipContent>Languages Used</TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400">
            Languages: {Object.keys(languages).join(', ')}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Total LOC: {loc.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};