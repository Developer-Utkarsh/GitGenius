import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface YearSelectorProps {
  years: number[];
  selectedYear: string;
  onYearChange: (year: string) => void;
  accountCreatedYear: number;
}

export const YearSelector = ({
  years,
  selectedYear,
  onYearChange,
  accountCreatedYear,
}: YearSelectorProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="year-picker gap-2 animate-in"
        >
          <Calendar className="h-4 w-4" />
          {selectedYear === "all" ? "All Time" : selectedYear}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="text-gradient text-xl font-bold">Select Year</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 p-4">
          <Button
            key="all"
            variant={selectedYear === "all" ? "default" : "outline"}
            onClick={() => onYearChange("all")}
            className="year-picker-button"
          >
            All Time
          </Button>
          {years
            .filter((year) => year >= accountCreatedYear)
            .map((year) => (
              <Button
                key={year}
                variant={selectedYear === year.toString() ? "default" : "outline"}
                onClick={() => onYearChange(year.toString())}
                className={`year-picker-button ${
                  selectedYear === year.toString() ? "selected" : ""
                }`}
              >
                {year}
              </Button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};