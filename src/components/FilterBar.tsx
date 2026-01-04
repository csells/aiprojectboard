import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  projectCount: number;
}

export function FilterBar({
  search,
  onSearchChange,
  projectCount,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects..."
          className="bg-secondary pl-9"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        <Sparkles className="mr-1 inline h-4 w-4 text-primary" />
        {projectCount} project{projectCount !== 1 ? "s" : ""} shared
      </p>
    </div>
  );
}
