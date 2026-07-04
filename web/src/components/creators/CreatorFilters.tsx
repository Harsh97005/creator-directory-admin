"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { NICHES, type Niche } from "@/types/creator";

const NICHE_LABELS: Record<Niche, string> = {
  beauty: "Beauty",
  fitness: "Fitness",
  travel: "Travel",
  food: "Food",
  tech: "Tech",
  fashion: "Fashion",
};

interface CreatorFiltersProps {
  niche: Niche | "all";
  minFollowers?: number;
  maxFollowers?: number;
  hasActiveFilters: boolean;
  onNicheChange: (niche: Niche | "all") => void;
  onFollowerRangeChange: (min?: number, max?: number) => void;
  onReset: () => void;
}

export function CreatorFilters({
  niche,
  minFollowers,
  maxFollowers,
  hasActiveFilters,
  onNicheChange,
  onFollowerRangeChange,
  onReset,
}: CreatorFiltersProps) {
  // Local text state so typing feels instant; the actual query only fires after the debounce.
  const [minInput, setMinInput] = useState(minFollowers?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(maxFollowers?.toString() ?? "");
  const debouncedMin = useDebouncedValue(minInput, 450);
  const debouncedMax = useDebouncedValue(maxInput, 450);

  useEffect(() => {
    setMinInput(minFollowers?.toString() ?? "");
    setMaxInput(maxFollowers?.toString() ?? "");
    // Only re-syncs from outside changes (e.g. the Reset filters button).
  }, [minFollowers, maxFollowers]);

  useEffect(() => {
    const min = debouncedMin === "" ? undefined : Number(debouncedMin);
    const max = debouncedMax === "" ? undefined : Number(debouncedMax);
    if (min === minFollowers && max === maxFollowers) return;
    onFollowerRangeChange(min, max);
    // Intentionally scoped to the debounced values only — including
    // minFollowers/maxFollowers/onFollowerRangeChange would re-fire this
    // effect on every parent re-render caused by the URL update it triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="niche-filter">Niche</Label>
        <Select value={niche} onValueChange={(value) => onNicheChange(value as Niche | "all")}>
          <SelectTrigger id="niche-filter" className="w-full sm:w-40">
            <SelectValue placeholder="All niches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All niches</SelectItem>
            {NICHES.map((n) => (
              <SelectItem key={n} value={n}>
                {NICHE_LABELS[n]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="min-followers">Min followers</Label>
        <Input
          id="min-followers"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="0"
          className="w-full sm:w-32"
          value={minInput}
          onChange={(e) => setMinInput(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="max-followers">Max followers</Label>
        <Input
          id="max-followers"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="No limit"
          className="w-full sm:w-32"
          value={maxInput}
          onChange={(e) => setMaxInput(e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Reset filters
        </Button>
      )}
    </div>
  );
}
