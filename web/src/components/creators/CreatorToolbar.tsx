import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreatorToolbarProps {
  onAddCreator: () => void;
}

export function CreatorToolbar({ onAddCreator }: CreatorToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Creators</h1>
        <p className="text-sm text-muted-foreground">
          Search, filter, and manage every creator in your directory.
        </p>
      </div>
      <Button onClick={onAddCreator}>
        <Plus className="h-4 w-4" />
        Add creator
      </Button>
    </div>
  );
}
