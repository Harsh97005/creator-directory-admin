import type { CreatorQueryParams } from "@/types/creator";

/**
 * Hierarchical query-key factory (TanStack Query best practice).
 *
 * creatorKeys.all                 -> ["creators"]
 * creatorKeys.lists()             -> ["creators", "list"]
 * creatorKeys.list(params)        -> ["creators", "list", { page, limit, sortBy, order, niche, ... }]
 * creatorKeys.detail(id)          -> ["creators", "detail", id]
 *
 * Invalidating creatorKeys.all() after any mutation invalidates every list
 * variant (any page/sort/filter combination) plus any cached detail views,
 * so the table always refreshes itself without a manual refetch button.
 */
export const creatorKeys = {
  all: ["creators"] as const,
  lists: () => [...creatorKeys.all, "list"] as const,
  list: (params: CreatorQueryParams) => [...creatorKeys.lists(), params] as const,
  details: () => [...creatorKeys.all, "detail"] as const,
  detail: (id: string) => [...creatorKeys.details(), id] as const,
};
