import { useMutation, useQueryClient } from "@tanstack/react-query";
import { creatorService } from "@/services/creator.service";
import { creatorKeys } from "@/hooks/query-keys";
import type { CreatorsResponse } from "@/types/creator";

export function useDeleteCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => creatorService.deleteCreator(id),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: creatorKeys.all });

      const previousLists = queryClient.getQueriesData<CreatorsResponse>({
        queryKey: creatorKeys.lists(),
      });

      queryClient.setQueriesData<CreatorsResponse>({ queryKey: creatorKeys.lists() }, (old) => {
        if (!old) return old;
        const hadRow = old.data.some((creator) => creator.id === id);
        return {
          ...old,
          data: old.data.filter((creator) => creator.id !== id),
          total: hadRow ? old.total - 1 : old.total,
        };
      });

      return { previousLists };
    },

    onError: (_err, _id, context) => {
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.all });
    },
  });
}
