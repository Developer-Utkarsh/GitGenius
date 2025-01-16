import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const RepositorySearch = () => {
  return (
    <div className="relative animate-in">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder="Search repositories..."
        className="pl-10 pr-4 py-2 w-full bg-white/5 border border-gray-200/20 rounded-lg focus:ring-2 focus:ring-primary/50 transition-all duration-200"
      />
      <Button 
        className="absolute right-2 top-1/2 -translate-y-1/2"
        size="sm"
      >
        Search
      </Button>
    </div>
  );
};