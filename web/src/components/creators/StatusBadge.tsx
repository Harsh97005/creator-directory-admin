import { Badge } from "@/components/ui/badge";
import type { CreatorStatus } from "@/types/creator";

export function StatusBadge({ status }: { status: CreatorStatus }) {
  return (
    <Badge variant={status === "active" ? "success" : "muted"}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active" ? "bg-success" : "bg-muted-foreground"
        }`}
      />
      {status === "active" ? "Active" : "Inactive"}
    </Badge>
  );
}
