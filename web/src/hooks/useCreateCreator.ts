import { useMutation, useQueryClient } from "@tanstack/react-query";
import { creatorService } from "@/services/creator.service";
import { creatorKeys } from "@/hooks/query-keys";
import type { CreatorInput } from "@/types/creator";

export function useCreateCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatorInput) => creatorService.createCreator(input),
    onSuccess: () => {
      // Where the new row lands depends on the server's current sort/filter/page,
      // so rather than guess a position we invalidate every cached list variant —
      // each active view refetches itself and shows the new creator in the right spot.
      queryClient.invalidateQueries({ queryKey: creatorKeys.all });
    },
  });
}
