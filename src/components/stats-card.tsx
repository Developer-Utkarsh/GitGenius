import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  tooltip?: string;
}

export const StatsCard = ({ title, value, icon, description, tooltip }: StatsCardProps) => {
  const content = (
    <Card className="stats-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <div className="text-primary/80 animate-pulse">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-400 mt-1 animate-fade-in">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="bg-black/90 border border-white/10">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};