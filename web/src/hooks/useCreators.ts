import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { creatorService } from "@/services/creator.service";
import { creatorKeys } from "@/hooks/query-keys";
import type { CreatorQueryParams } from "@/types/creator";

export function useCreators(params: CreatorQueryParams) {
  return useQuery({
    queryKey: creatorKeys.list(params),
    queryFn: () => creatorService.getCreators(params),
    // Keeps the previous page's rows on screen while the next page loads,
    // instead of flashing back to a skeleton on every page/sort/filter change.
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}
