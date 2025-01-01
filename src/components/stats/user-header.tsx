import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { YearSelector } from "@/components/year-selector";

interface UserHeaderProps {
  username: string;
  selectedYear: string;
  onYearChange: (year: string) => void;
  years: number[];
  accountCreatedYear: number;
}

export const UserHeader = ({ 
  username, 
  selectedYear, 
  onYearChange, 
  years,
  accountCreatedYear 
}: UserHeaderProps) => {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "The profile link has been copied to your clipboard.",
    });
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-4xl font-bold tracking-tight text-gradient">
        {username}'s GitHub Stats
      </h1>
      <div className="flex gap-4">
        <YearSelector
          years={years}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          accountCreatedYear={accountCreatedYear}
        />
        <Button
          variant="outline"
          className="gap-2 bg-black/20 hover:bg-black/40 border border-white/10 hover:border-gradient-blue-purple transition-all duration-300"
          onClick={handleCopyLink}
        >
          <Share2 className="h-4 w-4" />
          <Copy className="h-4 w-4" />
          Share Profile
        </Button>
      </div>
    </div>
  );
};