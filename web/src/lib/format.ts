/** 45200 -> "45.2K", 1250000 -> "1.3M", 800 -> "800" */
export function formatFollowers(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}

/** 3.8 -> "3.8%" */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** ISO date string -> "10 Jan 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
