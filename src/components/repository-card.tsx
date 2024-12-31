import { Code2, GitBranch, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RepositoryCardProps {
  name: string;
  description: string;
  stars: number;
  language: string;
  branches: number;
}

export const RepositoryCard = ({
  name,
  description,
  stars,
  language,
  branches,
}: RepositoryCardProps) => {
  return (
    <Card className="glass-card hover:bg-white/15 transition-all duration-200 animate-up">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <Code2 className="h-4 w-4" />
            <span>{language}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span>{branches} branches</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};