import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionDropdown } from "@/components/creators/ActionDropdown";
import { StatusBadge } from "@/components/creators/StatusBadge";
import { TableSkeleton } from "@/components/creators/TableSkeleton";
import { EmptyState } from "@/components/creators/EmptyState";
import { formatFollowers, formatPercentage } from "@/lib/format";
import type { Creator, SortableField, SortOrder } from "@/types/creator";
import { cn } from "@/lib/utils";

interface CreatorTableProps {
  creators: Creator[];
  isLoading: boolean;
  isFetching: boolean;
  sortBy?: SortableField;
  order: SortOrder;
  onSort: (field: SortableField) => void;
  onEdit: (creator: Creator) => void;
  onDelete: (creator: Creator) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

const NICHE_LABELS: Record<Creator["niche"], string> = {
  beauty: "Beauty",
  fitness: "Fitness",
  travel: "Travel",
  food: "Food",
  tech: "Tech",
  fashion: "Fashion",
};

function SortableHead({
  label,
  field,
  sortBy,
  order,
  onSort,
}: {
  label: string;
  field: SortableField;
  sortBy?: SortableField;
  order: SortOrder;
  onSort: (field: SortableField) => void;
}) {
  const active = sortBy === field;
  const Icon = active ? (order === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "flex items-center gap-1 rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring",
          active && "text-foreground"
        )}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </TableHead>
  );
}

export function CreatorTable({
  creators,
  isLoading,
  isFetching,
  sortBy,
  order,
  onSort,
  onEdit,
  onDelete,
  hasActiveFilters,
  onResetFilters,
}: CreatorTableProps) {
  return (
    <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-70")}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Niche</TableHead>
            <SortableHead
              label="Followers"
              field="followerCount"
              sortBy={sortBy}
              order={order}
              onSort={onSort}
            />
            <SortableHead
              label="Engagement"
              field="engagementRate"
              sortBy={sortBy}
              order={order}
              onSort={onSort}
            />
            <TableHead>Status</TableHead>
            <TableHead className="w-12 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <TableBody>
            {creators.map((creator) => (
              <TableRow key={creator.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{creator.name}</span>
                    <span className="text-xs text-muted-foreground">{creator.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {NICHE_LABELS[creator.niche]}
                </TableCell>
                <TableCell className="font-tabular">
                  {formatFollowers(creator.followerCount)}
                </TableCell>
                <TableCell className="font-tabular">
                  {formatPercentage(creator.engagementRate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={creator.status} />
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown creator={creator} onEdit={onEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>

      {!isLoading && creators.length === 0 && (
        <EmptyState hasActiveFilters={hasActiveFilters} onResetFilters={onResetFilters} />
      )}
    </div>
  );
}
