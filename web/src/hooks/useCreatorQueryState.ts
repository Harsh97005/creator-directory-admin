import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CreatorQueryParams, Niche, SortableField, SortOrder } from "@/types/creator";

const DEFAULT_LIMIT = 10;

function parseIntOr<T extends number>(value: string | null, fallback: T): number {
  const parsed = Number(value);
  return value !== null && !Number.isNaN(parsed) ? parsed : fallback;
}

export function useCreatorQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: CreatorQueryParams = useMemo(() => {
    const niche = searchParams.get("niche") as Niche | "all" | null;
    const sortBy = searchParams.get("sortBy") as SortableField | null;
    const order = searchParams.get("order") as SortOrder | null;
    const minFollowers = searchParams.get("minFollowers");
    const maxFollowers = searchParams.get("maxFollowers");

    return {
      page: parseIntOr(searchParams.get("page"), 1),
      limit: parseIntOr(searchParams.get("limit"), DEFAULT_LIMIT),
      sortBy: sortBy ?? undefined,
      order: order ?? "asc",
      niche: niche ?? "all",
      minFollowers: minFollowers ? Number(minFollowers) : undefined,
      maxFollowers: maxFollowers ? Number(maxFollowers) : undefined,
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (patch: Partial<CreatorQueryParams>, { resetPage = false } = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      const merged = { ...state, ...patch, ...(resetPage ? { page: 1 } : {}) };

      const setOrDelete = (key: string, value: unknown) => {
        if (value === undefined || value === null || value === "" || value === "all") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      };

      setOrDelete("page", merged.page === 1 ? undefined : merged.page);
      setOrDelete("limit", merged.limit === DEFAULT_LIMIT ? undefined : merged.limit);
      setOrDelete("sortBy", merged.sortBy);
      setOrDelete("order", merged.sortBy ? merged.order : undefined);
      setOrDelete("niche", merged.niche);
      setOrDelete("minFollowers", merged.minFollowers);
      setOrDelete("maxFollowers", merged.maxFollowers);

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, state]
  );

  const setPage = useCallback((page: number) => updateParams({ page }), [updateParams]);

  const toggleSort = useCallback(
    (field: SortableField) => {
      if (state.sortBy !== field) {
        updateParams({ sortBy: field, order: "desc" }, { resetPage: true });
      } else {
        updateParams({ order: state.order === "desc" ? "asc" : "desc" }, { resetPage: true });
      }
    },
    [state.sortBy, state.order, updateParams]
  );

  const setNiche = useCallback(
    (niche: Niche | "all") => updateParams({ niche }, { resetPage: true }),
    [updateParams]
  );

  const setFollowerRange = useCallback(
    (minFollowers?: number, maxFollowers?: number) =>
      updateParams({ minFollowers, maxFollowers }, { resetPage: true }),
    [updateParams]
  );

  const resetFilters = useCallback(
    () =>
      updateParams(
        { niche: "all", minFollowers: undefined, maxFollowers: undefined },
        { resetPage: true }
      ),
    [updateParams]
  );

  const hasActiveFilters = Boolean(
    (state.niche && state.niche !== "all") ||
      state.minFollowers !== undefined ||
      state.maxFollowers !== undefined
  );

  return { state, setPage, toggleSort, setNiche, setFollowerRange, resetFilters, hasActiveFilters };
}
