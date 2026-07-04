import { useMutation, useQueryClient } from "@tanstack/react-query";
import { creatorService } from "@/services/creator.service";
import { creatorKeys } from "@/hooks/query-keys";
import type { Creator, CreatorInput, CreatorsResponse } from "@/types/creator";

interface UpdateCreatorVars {
  id: string;
  input: Partial<CreatorInput>;
}

export function useUpdateCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateCreatorVars) =>
      creatorService.updateCreator(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: creatorKeys.all });

      const previousLists = queryClient.getQueriesData<CreatorsResponse>({
        queryKey: creatorKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<Creator>(creatorKeys.detail(id));

      // Patch the row in place everywhere it currently appears (any page/sort/filter).
      queryClient.setQueriesData<CreatorsResponse>({ queryKey: creatorKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((creator) =>
            creator.id === id ? { ...creator, ...input } : creator
          ),
        };
      });

      queryClient.setQueryData<Creator>(creatorKeys.detail(id), (old) =>
        old ? { ...old, ...input } : old
      );

      return { previousLists, previousDetail, id };
    },

    onError: (_err, _vars, context) => {
      // Roll back to the exact snapshots taken before the optimistic write.
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(creatorKeys.detail(context.id), context.previousDetail);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.all });
    },
  });
}
