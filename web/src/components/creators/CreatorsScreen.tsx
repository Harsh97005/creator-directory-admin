"use client";

import { useState } from "react";
import { CreatorToolbar } from "@/components/creators/CreatorToolbar";
import { CreatorFilters } from "@/components/creators/CreatorFilters";
import { CreatorTable } from "@/components/creators/CreatorTable";
import { Pagination } from "@/components/creators/Pagination";
import { ErrorState } from "@/components/creators/ErrorState";
import { CreatorDialog } from "@/components/creators/CreatorDialog";
import { DeleteDialog } from "@/components/creators/DeleteDialog";
import { useCreators } from "@/hooks/useCreators";
import { useCreatorQueryState } from "@/hooks/useCreatorQueryState";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Creator } from "@/types/creator";

export function CreatorsScreen() {
  const { state, setPage, toggleSort, setNiche, setFollowerRange, resetFilters, hasActiveFilters } =
    useCreatorQueryState();

  const { data, isLoading, isFetching, isError, error, refetch } = useCreators(state);

  const [dialogState, setDialogState] = useState<{ open: boolean; creator: Creator | null }>({
    open: false,
    creator: null,
  });
  const [creatorPendingDelete, setCreatorPendingDelete] = useState<Creator | null>(null);

  const openCreateDialog = () => setDialogState({ open: true, creator: null });
  const openEditDialog = (creator: Creator) => setDialogState({ open: true, creator });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <CreatorToolbar onAddCreator={openCreateDialog} />

      <CreatorFilters
        niche={state.niche ?? "all"}
        minFollowers={state.minFollowers}
        maxFollowers={state.maxFollowers}
        hasActiveFilters={hasActiveFilters}
        onNicheChange={setNiche}
        onFollowerRangeChange={setFollowerRange}
        onReset={resetFilters}
      />

      {isError ? (
        <ErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <CreatorTable
            creators={data?.data ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            sortBy={state.sortBy}
            order={state.order ?? "asc"}
            onSort={toggleSort}
            onEdit={openEditDialog}
            onDelete={setCreatorPendingDelete}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />

          {!isLoading && (data?.total ?? 0) > 0 && (
            <Pagination
              page={state.page}
              limit={state.limit}
              total={data?.total ?? 0}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <CreatorDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        creator={dialogState.creator}
      />

      <DeleteDialog
        creator={creatorPendingDelete}
        onOpenChange={(open) => !open && setCreatorPendingDelete(null)}
      />
    </div>
  );
}
