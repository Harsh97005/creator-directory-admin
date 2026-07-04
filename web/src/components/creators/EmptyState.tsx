import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export function EmptyState({ hasActiveFilters, onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No creators found.</p>
        <p className="text-sm text-muted-foreground">
          {hasActiveFilters
            ? "Try widening your filters to see more results."
            : "Add your first creator to get started."}
        </p>
      </div>
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          Reset filters
        </Button>
      )}
    </div>
  );
}
